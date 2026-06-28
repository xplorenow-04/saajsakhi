import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse, ApiError } from "../utils/apiUtils.js";
import { 
    placeOrderService, 
    getMyOrdersService, 
    getAllOrdersService, 
    updateOrderStatusService 
} from "../services/order.service.js";

/**
 * Place a new order
 */
export const placeOrder = asyncHandler(async (req, res) => {
    const { name, phone, address, city, pincode } = req.body;

    if (!name || !phone || !address || !city || !pincode) {
        throw new ApiError(400, "Shipping info (name, phone, address, city, pincode) is required.");
    }

    const { order, whatsappLink } = await placeOrderService(req.user._id, {
        name,
        phone,
        address,
        city,
        pincode
    });

    return res.status(201).json(
        new ApiResponse(201, { order, whatsappLink }, "Order placed successfully")
    );
});

/**
 * Get the current customer's order history
 */
export const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await getMyOrdersService(req.user._id);
    return res.status(200).json(
        new ApiResponse(200, orders, "Order history retrieved successfully")
    );
});

/**
 * Get all orders (Admin only)
 */
export const getAllOrders = asyncHandler(async (req, res) => {
    const data = await getAllOrdersService(req.query);
    return res.status(200).json(
        new ApiResponse(200, data, "All orders retrieved successfully")
    );
});

/**
 * Update an order's status (Admin only)
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const { orderId } = req.params;

    if (!status) {
        throw new ApiError(400, "Order status is required.");
    }

    const order = await updateOrderStatusService(orderId, status);
    return res.status(200).json(
        new ApiResponse(200, order, `Order status updated to ${status} successfully`)
    );
});
