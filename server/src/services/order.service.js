import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { Analytics } from "../models/analytics.model.js";
import { ApiError } from "../utils/apiUtils.js";
import { logger } from "../utils/logger.js";

class OrderService {
    async placeOrder(userId, shippingAddress) {
        const cart = await Cart.findOne({ user: userId }).populate("items.product");
        if (!cart || cart.items.length === 0) {
            throw new ApiError(400, "Cart is empty");
        }

        const orderedProducts = [];
        let totalPrice = 0;
        let totalDiscount = 0;

        for (const item of cart.items) {
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

        try {
            await Analytics.findOneAndUpdate(
                { date: new Date().toISOString().split("T")[0] },
                {
                    $inc: {
                        totalOrders: 1,
                        totalRevenue: finalAmount,
                        totalProductsSold: orderedProducts.length
                    }
                },
                { upsert: true }
            );
        } catch (e) {
            logger.warn("Analytics update failed", { error: e.message });
        }

        logger.info("Order placed", { orderId: order.orderId, userId, amount: finalAmount });
        return order;
    }

    async getOrderById(orderId, userId) {
        const order = await Order.findOne({ orderId }).populate("orderedProducts.product");
        if (!order) throw new ApiError(404, "Order not found");

        if (order.user.toString() !== userId.toString()) {
            throw new ApiError(403, "Not authorized to view this order");
        }

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

        if (order.user.toString() !== userId.toString()) {
            throw new ApiError(403, "Not authorized to cancel this order");
        }

        if (!["pending", "confirmed"].includes(order.orderStatus)) {
            throw new ApiError(400, "Order cannot be cancelled at current status");
        }

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

        order.orderStatus = "cancelled";
        await order.save();

        try {
            await Analytics.findOneAndUpdate(
                { date: new Date().toISOString().split("T")[0] },
                { $inc: { cancelledOrders: 1 } },
                { upsert: true }
            );
        } catch (e) {
            logger.warn("Analytics update failed", { error: e.message });
        }

        logger.info("Order cancelled", { orderId: order.orderId, userId });
        return order;
    }

    async adminGetAllOrders(query, page = 1, limit = 20) {
        const filter = {};
        if (query.status) filter.orderStatus = query.status;
        if (query.search) filter.orderId = { $regex: query.search, $options: "i" };

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

        logger.info("Order status updated", { orderId, status, updatedBy: "admin" });
        return order;
    }

    async getOrderAnalytics() {
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

        return {
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            ordersByStatus: statusCounts,
            dailyStats,
            recentOrders
        };
    }
}

export const orderService = new OrderService();
