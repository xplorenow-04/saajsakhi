import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/apiUtils.js";

/**
 * Get user's cart (creates one if not exists)
 */
export const getCartService = async (userId) => {
    let cart = await Cart.findOne({ userId }).populate("products.product");
    if (!cart) {
        cart = await Cart.create({ userId, products: [] });
    }
    return cart;
};

/**
 * Add an item to user's cart
 */
export const addToCartService = async (userId, productId, quantity = 1, size) => {
    if (!size || size.trim() === "") {
        throw new ApiError(400, "Size is required");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new ApiError(404, "Product not found");
    }

    if (product.stock < quantity) {
        throw new ApiError(400, `Insufficient stock. Only ${product.stock} items available.`);
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = new Cart({ userId, products: [] });
    }

    // Check if product with same size already exists in cart
    const itemIndex = cart.products.findIndex(
        (p) => p.product.toString() === productId && p.size === size
    );

    if (itemIndex > -1) {
        cart.products[itemIndex].quantity += quantity;
    } else {
        cart.products.push({ product: productId, quantity, size });
    }

    await cart.save();
    return await getCartService(userId);
};

/**
 * Update quantity or size of a cart item
 */
export const updateCartItemService = async (userId, productId, quantity, size) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const itemIndex = cart.products.findIndex(
        (p) => p.product.toString() === productId && p.size === size
    );

    if (itemIndex === -1) {
        throw new ApiError(404, "Item not found in cart");
    }

    // Verify stock
    const product = await Product.findById(productId);
    if (product && product.stock < quantity) {
        throw new ApiError(400, `Insufficient stock. Only ${product.stock} items available.`);
    }

    cart.products[itemIndex].quantity = quantity;
    await cart.save();
    
    return await getCartService(userId);
};

/**
 * Remove an item from the cart
 */
export const removeFromCartService = async (userId, productId, size) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    cart.products = cart.products.filter(
        (p) => !(p.product.toString() === productId && p.size === size)
    );

    await cart.save();
    return await getCartService(userId);
};

/**
 * Clear the entire cart
 */
export const clearCartService = async (userId) => {
    const cart = await Cart.findOne({ userId });
    if (cart) {
        cart.products = [];
        await cart.save();
    }
    return cart;
};
