import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { createEcommerceNotification } from "./notification.service.js";
import { deleteCachedKeys } from "./redis.service.js";
import { ApiError } from "../utils/apiUtils.js";

/**
 * Place a new order
 */
export const placeOrderService = async (userId, shippingInfo) => {
    const { name, phone, address, city, pincode } = shippingInfo;
    
    if (!name || !phone || !address || !city || !pincode) {
        throw new ApiError(400, "All shipping details (name, phone, address, city, pincode) are required.");
    }

    // Get user cart
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "Your cart is empty. Cannot place an order.");
    }

    const orderedProducts = [];
    let totalPrice = 0;
    let totalDiscount = 0;

    // Verify stock and calculate total price
    for (const item of cart.items) {
        const product = item.product;
        if (!product) {
            throw new ApiError(404, "One of the products in your cart no longer exists.");
        }

        const sizeEntry = product.sizes?.find(s => s.size === item.size);
        const sizeStock = sizeEntry?.stock || 0;
        if (sizeStock < item.quantity) {
            throw new ApiError(400, `Product [${product.name}] in size ${item.size} is out of stock or has insufficient quantity.`);
        }

        const itemDiscount = (product.price * (product.discount || 0)) / 100;
        totalPrice += product.price * item.quantity;
        totalDiscount += itemDiscount * item.quantity;

        orderedProducts.push({
            product: product._id,
            name: product.name,
            size: item.size,
            quantity: item.quantity,
            price: product.price,
            discount: product.discount || 0,
            image: product.images?.[0]?.url || ""
        });
    }

    // Decrement stock in database (per-size)
    for (const item of cart.items) {
        await Product.findOneAndUpdate(
            { _id: item.product._id, "sizes.size": item.size },
            { $inc: { "sizes.$.stock": -item.quantity } }
        );
    }

    const finalAmount = totalPrice - totalDiscount;

    // Create the order
    const order = await Order.create({
        user: userId,
        orderedProducts,
        totalPrice,
        totalDiscount,
        finalAmount,
        shippingAddress: { name, phone, address, city, pincode },
        whatsappSent: false,
        orderStatus: "pending"
    });

    // Clear user cart
    cart.items = [];
    await cart.save();

    // Create notification for the user
    await createEcommerceNotification(
        userId,
        "order_success",
        `Your order (ID: ${order.orderId || order._id}) has been placed successfully for a total of ₹${finalAmount.toLocaleString()}.`
    );

    // Invalidate analytics caches
    await deleteCachedKeys("analytics:*");
    // Also invalidate product list because stock counts have changed!
    await deleteCachedKeys("products:list:*");
    await deleteCachedKeys("products:featured");
    for (const item of orderedProducts) {
        await deleteCachedKeys(`product:detail:${item.product}`);
    }

    // Create WhatsApp message format
    let itemsText = "";
    orderedProducts.forEach((item, idx) => {
        const itemPrice = item.price - (item.price * item.discount) / 100;
        itemsText += `${idx + 1}. ${item.name} (${item.size}) x${item.quantity} - ₹${(itemPrice * item.quantity).toLocaleString()}\n`;
    });

    const whatsappNo = process.env.WHATSAPP_NO || "9172346386"; // default backup
    const msg = `*🛒 New Order Placed on Saaj Sakhi*\n\n` +
                `*Order Details:*\n` +
                `• Order ID: ${order.orderId || order._id}\n` +
                `• Name: ${name}\n` +
                `• Phone: ${phone}\n` +
                `• Address: ${address}, ${city} - ${pincode}\n\n` +
                `*Items Ordered:*\n${itemsText}\n` +
                `*Total Price:* ₹${finalAmount.toLocaleString()}\n\n` +
                `Please confirm my order. Thank you!`;

    const encodedMessage = encodeURIComponent(msg);
    const whatsappLink = `https://wa.me/${whatsappNo}?text=${encodedMessage}`;

    return { order, whatsappLink };
};

/**
 * Get logged-in user order history
 */
export const getMyOrdersService = async (userId) => {
    return await Order.find({ user: userId })
        .populate("orderedProducts.product")
        .sort({ createdAt: -1 });
};

/**
 * Get all orders (Admin function with pagination & status filters)
 */
export const getAllOrdersService = async (queries = {}) => {
    const page = parseInt(queries.page) || 1;
    const limit = parseInt(queries.limit) || 10;
    const skip = (page - 1) * limit;

    const { status, search } = queries;
    const dbQuery = {};

    if (status && status.trim() !== "") {
        dbQuery.orderStatus = status.toLowerCase();
    }

    if (search && search.trim() !== "") {
        // Search by phone or order ID
        if (search.match(/^[0-9a-fA-F]{24}$/)) {
            dbQuery._id = search;
        } else {
            dbQuery.phone = { $regex: search, $options: "i" };
        }
    }

    const totalOrders = await Order.countDocuments(dbQuery);
    const orders = await Order.find(dbQuery)
        .populate("user", "name email")
        .populate("orderedProducts.product")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    return {
        orders,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalOrders / limit),
            totalOrders,
            limit
        }
    };
};

/**
 * Update order status (Admin)
 */
export const updateOrderStatusService = async (orderId, status) => {
    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    const statusLower = status.toLowerCase();
    if (!validStatuses.includes(statusLower)) {
        throw new ApiError(400, "Invalid status type.");
    }

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    order.orderStatus = statusLower;
    await order.save();

    // Create user notification
    await createEcommerceNotification(
        order.user,
        "order_status_update",
        `Your order (ID: ${order.orderId || order._id}) status has been updated to "${statusLower}".`
    );

    // Invalidate analytics caches
    await deleteCachedKeys("analytics:*");

    return order;
};
