import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { Analytics } from "../models/analytics.model.js";
import { ApiError } from "../utils/apiUtils.js";
import { logger } from "../utils/logger.js";
import { redisService } from "./redis.service.js";

class OrderService {
    async placeOrder(userId, shippingAddress) {
        const cart = await Cart.findOne({ user: userId }).populate("items.product");
        if (!cart || cart.items.length === 0) {
            throw new ApiError(400, "Cart is empty");
        }

        const { orderedProducts, totalPrice, totalDiscount } = await this._processCartItems(cart.items);

        const finalAmount = totalPrice - totalDiscount;

        const order = await Order.create({
            user: userId,
            orderedProducts,
            totalPrice,
            totalDiscount,
            finalAmount,
            shippingAddress,
            orderStatus: "pending"
        });

        cart.items = [];
        await cart.save();

        await this._updateAnalytics(finalAmount, orderedProducts.length);
        await redisService.delByPattern("admin:*");

        logger.info("Order placed", { orderId: order.orderId, userId, amount: finalAmount });
        return order;
    }

    async placeGuestOrder(products, guestInfo, shippingAddress) {
        if (!products || products.length === 0) {
            throw new ApiError(400, "No products specified");
        }

        const orderedProducts = [];
        let totalPrice = 0;
        let totalDiscount = 0;

        for (const item of products) {
            const product = await Product.findById(item.productId);
            if (!product || !product.isActive) {
                throw new ApiError(400, "Product not found or unavailable");
            }

            const sizeData = product.sizes.find(s => s.size === item.size);
            if (!sizeData || sizeData.stock < item.quantity) {
                throw new ApiError(400, `Insufficient stock for ${product.name} - size ${item.size}`);
            }

            const itemPrice = product.price * item.quantity;
            const itemDiscount = (product.price * (product.discount || 0) / 100) * item.quantity;
            const discountedPrice = product.price - (product.price * (product.discount || 0) / 100);

            orderedProducts.push({
                product: product._id,
                name: product.name,
                size: item.size,
                quantity: item.quantity,
                price: discountedPrice,
                discount: product.discount || 0,
                image: product.images?.[0]?.url || ""
            });

            totalPrice += itemPrice;
            totalDiscount += itemDiscount;

            sizeData.stock -= item.quantity;
            await product.save();
        }

        const finalAmount = totalPrice - totalDiscount;

        const order = await Order.create({
            isGuestOrder: true,
            guestInfo: {
                name: guestInfo.name,
                phone: guestInfo.phone,
                address: guestInfo.address,
                city: guestInfo.city,
                state: guestInfo.state || "",
                pincode: guestInfo.pincode
            },
            orderedProducts,
            totalPrice,
            totalDiscount,
            finalAmount,
            shippingAddress: {
                name: guestInfo.name,
                phone: guestInfo.phone,
                address: guestInfo.address,
                city: guestInfo.city,
                pincode: guestInfo.pincode
            },
            orderStatus: "pending"
        });

        await this._updateAnalytics(finalAmount, orderedProducts.length);
        await redisService.delByPattern("admin:*");

        logger.info("Guest order placed", { orderId: order.orderId, amount: finalAmount });
        return order;
    }

    async createManualOrder(adminId, data) {
        const orderedProducts = [];
        let totalPrice = 0;
        let totalDiscount = 0;

        for (const item of data.products) {
            const product = await Product.findById(item.productId);
            if (!product || !product.isActive) {
                throw new ApiError(400, `Product not found: ${item.productId}`);
            }

            const sizeData = product.sizes.find(s => s.size === item.size);
            if (!sizeData || sizeData.stock < item.quantity) {
                throw new ApiError(400, `Insufficient stock for ${product.name} - size ${item.size}`);
            }

            const itemPrice = product.price * item.quantity;
            const itemDiscount = (product.price * (product.discount || 0) / 100) * item.quantity;
            const discountedPrice = product.price - (product.price * (product.discount || 0) / 100);

            orderedProducts.push({
                product: product._id,
                name: product.name,
                size: item.size,
                quantity: item.quantity,
                price: discountedPrice,
                discount: product.discount || 0,
                image: product.images?.[0]?.url || ""
            });

            totalPrice += itemPrice;
            totalDiscount += itemDiscount;

            sizeData.stock -= item.quantity;
            await product.save();
        }

        const finalAmount = totalPrice - totalDiscount;

        const shippingAddress = {
            name: data.customerName,
            phone: data.customerPhone,
            address: data.customerAddress,
            city: data.customerCity,
            pincode: data.customerPincode
        };

        const order = await Order.create({
            orderedProducts,
            totalPrice,
            totalDiscount,
            finalAmount,
            shippingAddress,
            orderStatus: data.orderStatus || "pending"
        });

        await this._updateAnalytics(finalAmount, orderedProducts.length);
        await redisService.delByPattern("admin:*");

        logger.info("Manual order created by admin", { orderId: order.orderId, adminId });
        return order;
    }

    async getOrderById(orderId, userId = null) {
        const query = userId ? { orderId, user: userId } : { orderId };
        const order = await Order.findOne(query).populate("orderedProducts.product");
        if (!order) throw new ApiError(404, "Order not found");
        return order;
    }

    async getUserOrders(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            Order.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
            Order.countDocuments({ user: userId })
        ]);

        return {
            orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        };
    }

    async cancelOrder(orderId, userId) {
        const order = await Order.findOne({ orderId });
        if (!order) throw new ApiError(404, "Order not found");

        if (order.user && order.user.toString() !== userId.toString()) {
            throw new ApiError(403, "Not authorized to cancel this order");
        }

        if (!["pending", "confirmed"].includes(order.orderStatus)) {
            throw new ApiError(400, "Order cannot be cancelled at current status");
        }

        await this._restoreStock(order);

        order.orderStatus = "cancelled";
        await order.save();

        await this._updateCancelledAnalytics();
        await redisService.delByPattern("admin:*");

        logger.info("Order cancelled", { orderId: order.orderId, userId });
        return order;
    }

    async adminGetAllOrders(query, page = 1, limit = 20) {
        const filter = {};
        if (query.status) filter.orderStatus = query.status;
        if (query.search) filter.orderId = { $regex: query.search, $options: "i" };
        if (query.isGuestOrder) filter.isGuestOrder = query.isGuestOrder === "true";

        const skip = (page - 1) * limit;
        const [orders, total] = await Promise.all([
            Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)
                .populate("user", "name email").lean(),
            Order.countDocuments(filter)
        ]);

        return {
            orders,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        };
    }

    async adminUpdateOrderStatus(orderId, status) {
        const validStatuses = ["pending", "confirmed", "processing", "delivered", "cancelled"];
        if (!validStatuses.includes(status)) {
            throw new ApiError(400, "Invalid order status");
        }

        const order = await Order.findOne({ orderId });
        if (!order) throw new ApiError(404, "Order not found");

        if (order.orderStatus === "cancelled" && status !== "cancelled") {
            throw new ApiError(400, "Cannot change status of cancelled order");
        }

        if (order.orderStatus === "delivered") {
            throw new ApiError(400, "Cannot change status of delivered order");
        }

        order.orderStatus = status;
        await order.save();
        await redisService.delByPattern("admin:*");

        logger.info("Order status updated", { orderId, status, updatedBy: "admin" });
        return order;
    }

    async deleteOrder(orderId) {
        const order = await Order.findOne({ orderId });
        if (!order) throw new ApiError(404, "Order not found");

        await Order.findByIdAndDelete(order._id);
        await redisService.delByPattern("admin:*");

        logger.info("Order deleted", { orderId });
        return { deleted: true };
    }

    async getOrderAnalytics() {
        const cacheKey = "admin:analytics";
        const cached = await redisService.get(cacheKey);
        if (cached) return cached;

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const [totalOrders, totalRevenue, ordersByStatus, dailyStats, recentOrders] = await Promise.all([
            Order.countDocuments(),
            Order.aggregate([
                { $match: { orderStatus: { $ne: "cancelled" } } },
                { $group: { _id: null, total: { $sum: "$finalAmount" } } }
            ]),
            Order.aggregate([
                { $group: { _id: "$orderStatus", count: { $sum: 1 } } }
            ]),
            Order.aggregate([
                { $match: { createdAt: { $gte: thirtyDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        orders: { $sum: 1 },
                        revenue: { $sum: "$finalAmount" }
                    }
                },
                { $sort: { _id: 1 } }
            ]),
            Order.find().sort({ createdAt: -1 }).limit(5).populate("user", "name").lean()
        ]);

        const statusCounts = {};
        ordersByStatus.forEach(s => { statusCounts[s._id] = s.count; });

        const result = {
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            ordersByStatus: statusCounts,
            dailyStats,
            recentOrders
        };

        await redisService.set(cacheKey, result, 600);
        return result;
    }

    async _processCartItems(cartItems) {
        const orderedProducts = [];
        let totalPrice = 0;
        let totalDiscount = 0;

        for (const item of cartItems) {
            const product = item.product;
            if (!product || !product.isActive) {
                throw new ApiError(400, `Product "${product?.name || 'Unknown'}" is no longer available`);
            }

            const sizeData = product.sizes.find(s => s.size === item.size);
            if (!sizeData || sizeData.stock < item.quantity) {
                throw new ApiError(400, `Insufficient stock for ${product.name} - size ${item.size}`);
            }

            const itemPrice = product.price * item.quantity;
            const itemDiscount = (product.price * (product.discount || 0) / 100) * item.quantity;
            const discountedPrice = product.price - (product.price * (product.discount || 0) / 100);

            orderedProducts.push({
                product: product._id,
                name: product.name,
                size: item.size,
                quantity: item.quantity,
                price: discountedPrice,
                discount: product.discount || 0,
                image: product.images?.[0]?.url || ""
            });

            totalPrice += itemPrice;
            totalDiscount += itemDiscount;

            sizeData.stock -= item.quantity;
            await product.save();
        }

        return { orderedProducts, totalPrice, totalDiscount };
    }

    async _restoreStock(order) {
        for (const item of order.orderedProducts) {
            try {
                await Product.findByIdAndUpdate(item.product, {
                    $inc: { "sizes.$[elem].stock": item.quantity }
                }, {
                    arrayFilters: [{ "elem.size": item.size }]
                });
            } catch (e) {
                logger.warn("Stock restore failed on cancel", { error: e.message });
            }
        }
    }

    async _updateAnalytics(finalAmount, productsSold) {
        try {
            await Analytics.findOneAndUpdate(
                { date: new Date().toISOString().split("T")[0] },
                {
                    $inc: {
                        totalOrders: 1,
                        totalRevenue: finalAmount,
                        totalProductsSold: productsSold
                    }
                },
                { upsert: true }
            );
        } catch (e) {
            logger.warn("Analytics update failed", { error: e.message });
        }
    }

    async _updateCancelledAnalytics() {
        try {
            await Analytics.findOneAndUpdate(
                { date: new Date().toISOString().split("T")[0] },
                { $inc: { cancelledOrders: 1 } },
                { upsert: true }
            );
        } catch (e) {
            logger.warn("Analytics update failed", { error: e.message });
        }
    }
}

export const orderService = new OrderService();
