import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiUtils.js";
import { orderService } from "../services/order.service.js";
import { logger } from "../utils/logger.js";

const WHATSAPP_NUMBER = process.env.WHATSAPP_NO || "9022565195";

function generateWhatsAppMessage(order) {
    let message = "*New Order Placed!*";
    message += `\n*Order ID:* ${order.orderId}`;
    message += `\n*Date:* ${new Date(order.createdAt).toLocaleString()}`;
    message += "\n\n*Products Ordered:*";

    order.orderedProducts.forEach((item, index) => {
        message += `\n${index + 1}. *${item.name}*`;
        message += `\n   Size: ${item.size} | Qty: ${item.quantity}`;
        message += `\n   Price: Rs.${(item.price * item.quantity).toFixed(2)}`;
    });

    message += `\n\n*Total Amount:* Rs.${order.finalAmount.toFixed(2)}`;
    message += `\n*Total Discount:* Rs.${(order.totalPrice - order.finalAmount).toFixed(2)}`;
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

    if (!shippingAddress || !shippingAddress.name || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city || !shippingAddress.pincode) {
        return res.status(400).json(
            new ApiResponse(400, null, "All shipping address fields are required")
        );
    }

    const order = await orderService.placeOrder(req.user._id, shippingAddress);

    const whatsappMessage = generateWhatsAppMessage(order);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

    return res.status(201).json(
        new ApiResponse(201, { order, whatsappUrl }, "Order placed successfully")
    );
});

export const placeGuestOrder = asyncHandler(async (req, res) => {
    const { products, guestInfo } = req.body;

    if (!products || !Array.isArray(products) || products.length === 0) {
        return res.status(400).json(
            new ApiResponse(400, null, "Products array is required")
        );
    }

    if (!guestInfo || !guestInfo.name || !guestInfo.phone || !guestInfo.address || !guestInfo.city || !guestInfo.pincode) {
        return res.status(400).json(
            new ApiResponse(400, null, "All guest info fields are required")
        );
    }

    for (const item of products) {
        if (!item.productId || !item.size || !item.quantity) {
            return res.status(400).json(
                new ApiResponse(400, null, "Each product must have productId, size, and quantity")
            );
        }
    }

    const shippingAddress = {
        name: guestInfo.name,
        phone: guestInfo.phone,
        address: guestInfo.address,
        city: guestInfo.city,
        pincode: guestInfo.pincode
    };

    const order = await orderService.placeGuestOrder(products, guestInfo, shippingAddress);

    const whatsappMessage = generateWhatsAppMessage(order);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

    return res.status(201).json(
        new ApiResponse(201, { order, whatsappUrl }, "Order placed successfully")
    );
});

export const createManualOrder = asyncHandler(async (req, res) => {
    const data = req.body;

    if (!data.customerName || !data.customerPhone || !data.customerAddress || !data.customerCity || !data.customerPincode) {
        return res.status(400).json(
            new ApiResponse(400, null, "All customer fields are required")
        );
    }

    if (!data.products || !Array.isArray(data.products) || data.products.length === 0) {
        return res.status(400).json(
            new ApiResponse(400, null, "At least one product is required")
        );
    }

    for (const item of data.products) {
        if (!item.productId || !item.size || !item.quantity) {
            return res.status(400).json(
                new ApiResponse(400, null, "Each product must have productId, size, and quantity")
            );
        }
    }

    const order = await orderService.createManualOrder(req.user._id, data);

    const whatsappMessage = generateWhatsAppMessage(order);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

    return res.status(201).json(
        new ApiResponse(201, { order, whatsappUrl }, "Manual order created successfully")
    );
});

export const getOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const order = await orderService.getOrderById(orderId, req.user?._id);

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
