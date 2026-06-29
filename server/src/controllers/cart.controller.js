import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/apiUtils.js";
import { cartService } from "../services/cart.service.js";
import mongoose from "mongoose";

export const getCart = asyncHandler(async (req, res) => {
    const cart = await cartService.getCart(req.user._id);

    return res.status(200).json(
        new ApiResponse(200, cart, "Cart fetched successfully")
    );
});

export const addToCart = asyncHandler(async (req, res) => {
    const { productId, size, quantity } = req.body;

    if (!productId || productId.trim() === "") {
        return res.status(400).json(
            new ApiResponse(400, null, "Product ID is required")
        );
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
        return res.status(400).json(
            new ApiResponse(400, null, "Invalid product ID")
        );
    }

    if (!size || size.trim() === "") {
        return res.status(400).json(
            new ApiResponse(400, null, "Size is required")
        );
    }

    const qty = parseInt(quantity) || 1;
    if (qty < 1) {
        return res.status(400).json(
            new ApiResponse(400, null, "Quantity must be at least 1")
        );
    }

    const cart = await cartService.addToCart(req.user._id, productId, size.trim(), qty);

    return res.status(200).json(
        new ApiResponse(200, cart, "Item added to cart successfully")
    );
});

export const updateCartItem = asyncHandler(async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json(
            new ApiResponse(400, null, "Invalid cart item ID")
        );
    }

    const qty = parseInt(quantity);
    if (!qty || qty < 1) {
        return res.status(400).json(
            new ApiResponse(400, null, "Quantity must be at least 1")
        );
    }

    const cart = await cartService.updateCartItem(req.user._id, itemId, qty);

    return res.status(200).json(
        new ApiResponse(200, cart, "Cart updated successfully")
    );
});

export const removeFromCart = asyncHandler(async (req, res) => {
    const { itemId } = req.params;

    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
        return res.status(400).json(
            new ApiResponse(400, null, "Invalid cart item ID")
        );
    }

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
