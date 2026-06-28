import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse, ApiError } from "../utils/apiUtils.js";
import { 
    getCartService, 
    addToCartService, 
    updateCartItemService, 
    removeFromCartService, 
    clearCartService 
} from "../services/cart.service.js";

/**
 * Fetch the authenticated user's cart
 */
export const getCart = asyncHandler(async (req, res) => {
    const cart = await getCartService(req.user._id);
    return res.status(200).json(
        new ApiResponse(200, cart, "Cart fetched successfully")
    );
});

/**
 * Add an item to the cart
 */
export const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity, size } = req.body;

    if (!productId || !size) {
        throw new ApiError(400, "Product ID and size are required.");
    }

    const cart = await addToCartService(req.user._id, productId, Number(quantity || 1), size);
    return res.status(200).json(
        new ApiResponse(200, cart, "Item added to cart successfully")
    );
});

/**
 * Update quantity of a cart item
 */
export const updateCartItem = asyncHandler(async (req, res) => {
    const { productId, quantity, size } = req.body;

    if (!productId || !size || quantity === undefined) {
        throw new ApiError(400, "Product ID, size, and quantity are required.");
    }

    const cart = await updateCartItemService(req.user._id, productId, Number(quantity), size);
    return res.status(200).json(
        new ApiResponse(200, cart, "Cart item updated successfully")
    );
});

/**
 * Remove an item from the cart
 */
export const removeFromCart = asyncHandler(async (req, res) => {
    const { productId, size } = req.params;

    if (!productId || !size) {
        throw new ApiError(400, "Product ID and size are required parameters.");
    }

    const cart = await removeFromCartService(req.user._id, productId, size);
    return res.status(200).json(
        new ApiResponse(200, cart, "Item removed from cart successfully")
    );
});

/**
 * Clear the cart
 */
export const clearCart = asyncHandler(async (req, res) => {
    const cart = await clearCartService(req.user._id);
    return res.status(200).json(
        new ApiResponse(200, cart, "Cart cleared successfully")
    );
});
