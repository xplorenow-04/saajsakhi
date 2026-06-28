import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiUtils.js";
import { orderService } from "../services/order.service.js";
import { logger } from "../utils/logger.js";

const WHATSAPP_NUMBER = process.env.WHATSAPP_NO || "9022565195";

function generateWhatsAppMessage(order) {
    let message = "🛒 *New Order Placed!*\n\n";
    message += `*Order ID:* ${order.orderId}\n`;
    message += `*Date:* ${new Date(order.createdAt).toLocaleString()}\n\n`;
    message += "*Products Ordered:*\n";

    order.orderedProducts.forEach((item, index) => {
        message += `${index + 1}. *${item.name}*\n`;
        message += `   Size: ${item.size}\n`;
        message += `   Qty: ${item.quantity}\n`;
        message += `   Price: ₹${(item.price * item.quantity).toFixed(2)}\n`;
    });

    message += `\n*Total Amount:* ₹${order.finalAmount.toFixed(2)}`;
    message += `\n*Total Discount:* ₹${(order.totalPrice - order.finalAmount).toFixed(2)}`;
    message += `\n\n*Shipping Details:*`;
    message += `\n*Name:* ${order.shippingAddress.name}`;
    message += `\n*Phone:* ${order.shippingAddress.phone}`;
    message += `\n*Address:* ${order.shippingAddress.address}`;
    message += `\n*City:* ${order.shippingAddress.city}`;
    message += `\n*Pincode:* ${order.shippingAddress.pincode}`;

    return encodeURIComponent(message);
}

export const placeOrder = asyncHandler(async (req, res) => {
    const { shippingAddress } = req.body;
    const order = await orderService.placeOrder(req.user._id, shippingAddress);

    const whatsappMessage = generateWhatsAppMessage(order);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

    logger.info("Order placed with WhatsApp message", { orderId: order.orderId });

    return res.status(201).json(
        new ApiResponse(201, {
            order,
            whatsappUrl
        }, "Order placed successfully")
    );
});

export const getOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const order = await orderService.getOrderById(orderId, req.user._id);

    return res.status(200).json(
        new ApiResponse(200, order, "Order fetched successfully")
    );
});

export const getUserOrders = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const result = await orderService.getUserOrders(req.user._id, parseInt(page), parseInt(limit));

    return res.status(200).json(
        new ApiResponse(200, result, "Orders fetched successfully")
    );
});

export const cancelOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const order = await orderService.cancelOrder(orderId, req.user._id);

    return res.status(200).json(
        new ApiResponse(200, order, "Order cancelled successfully")
    );
});
