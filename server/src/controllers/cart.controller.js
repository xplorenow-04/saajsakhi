import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiUtils.js";
import { cartService } from "../services/cart.service.js";

export const getCart = asyncHandler(async (req, res) => {
    const cart = await cartService.getCart(req.user._id);

    return res.status(200).json(
        new ApiResponse(200, cart, "Cart fetched successfully")
    );
});

export const addToCart = asyncHandler(async (req, res) => {
    const { productId, size, quantity } = req.body;
    const cart = await cartService.addToCart(req.user._id, productId, size, quantity || 1);

    return res.status(200).json(
        new ApiResponse(200, cart, "Item added to cart successfully")
    );
});

export const updateCartItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const cart = await cartService.updateCartItem(req.user._id, itemId, quantity);

    return res.status(200).json(
        new ApiResponse(200, cart, "Cart updated successfully")
    );
});

export const removeFromCart = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const cart = await cartService.removeFromCart(req.user._id, itemId);

    return res.status(200).json(
        new ApiResponse(200, cart, "Item removed from cart successfully")
    );
});

export const clearCart = asyncHandler(async (req, res) => {
    const result = await cartService.clearCart(req.user._id);

    return res.status(200).json(
        new ApiResponse(200, result, "Cart cleared successfully")
    );
});
