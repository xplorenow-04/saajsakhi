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
    const cart = await Cart.findOne({ userId }).populate("products.product");
    if (!cart || cart.products.length === 0) {
        throw new ApiError(400, "Your cart is empty. Cannot place an order.");
    }

    const orderedProducts = [];
    let totalPrice = 0;

    // Verify stock and calculate total price
    for (const item of cart.products) {
        const product = item.product;
        if (!product) {
            throw new ApiError(404, "One of the products in your cart no longer exists.");
        }

        if (product.stock < item.quantity) {
            throw new ApiError(400, `Product [${product.name}] is out of stock or has insufficient quantity.`);
        }

        const unitPrice = product.discount > 0 
            ? product.price - product.discount 
            : product.price;

        totalPrice += unitPrice * item.quantity;
        orderedProducts.push({
            product: product._id,
            quantity: item.quantity,
            size: item.size,
            price: unitPrice,
            name: product.name // temporarily keep name for WhatsApp message construction
        });
    }

    // Decrement stock in database
    for (const item of cart.products) {
        await Product.findByIdAndUpdate(item.product._id, {
            $inc: { stock: -item.quantity }
        });
    }

    // Create the order
    const order = await Order.create({
        userId,
        orderedProducts,
        totalPrice,
        shippingAddress: `${address}, ${city} - ${pincode}`,
        phone,
        whatsappSent: false,
        orderStatus: "Pending"
    });

    // Clear user cart
    cart.products = [];
    await cart.save();

    // Create notification for the user
    await createEcommerceNotification(
        userId,
        "order_success",
        `Your order (ID: ${order._id}) has been placed successfully for a total of ₹${totalPrice.toLocaleString()}.`
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
        itemsText += `${idx + 1}. ${item.name} (${item.size}) x${item.quantity} - ₹${(item.price * item.quantity).toLocaleString()}\n`;
    });

    const whatsappNo = process.env.WHATSAPP_NO || "9172346386"; // default backup
    const msg = `*🛒 New Order Placed on Saaj Sakhi*\n\n` +
                `*Order Details:*\n` +
                `• Order ID: ${order._id}\n` +
                `• Name: ${name}\n` +
                `• Phone: ${phone}\n` +
                `• Address: ${address}, ${city} - ${pincode}\n\n` +
                `*Items Ordered:*\n${itemsText}\n` +
                `*Total Price:* ₹${totalPrice.toLocaleString()}\n\n` +
                `Please confirm my order. Thank you!`;

    const encodedMessage = encodeURIComponent(msg);
    const whatsappLink = `https://wa.me/${whatsappNo}?text=${encodedMessage}`;

    return { order, whatsappLink };
};

/**
 * Get logged-in user order history
 */
export const getMyOrdersService = async (userId) => {
    return await Order.find({ userId })
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
        dbQuery.orderStatus = status;
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
        .populate("userId", "name email")
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
    const validStatuses = ["Pending", "Confirmed", "Processing", "Delivered", "Cancelled"];
    if (!validStatuses.includes(status)) {
        throw new ApiError(400, "Invalid status type.");
    }

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    order.orderStatus = status;
    await order.save();

    // Create user notification
    await createEcommerceNotification(
        order.userId,
        "order_status_update",
        `Your order (ID: ${order._id}) status has been updated to "${status}".`
    );

    // Invalidate analytics caches
    await deleteCachedKeys("analytics:*");

    return order;
};
