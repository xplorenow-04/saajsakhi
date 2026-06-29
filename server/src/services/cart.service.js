import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/apiUtils.js";

/**
 * Get user's cart (creates one if not exists)
 */
export const getCartService = async (userId) => {
    let cart = await Cart.findOne({ user: userId }).populate("items.product");
    if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
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

    const sizeStock = product.sizes?.find(s => s.size === size)?.stock || 0;
    if (sizeStock < quantity) {
        throw new ApiError(400, `Insufficient stock. Only ${sizeStock} items available for size ${size}.`);
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = new Cart({ user: userId, items: [] });
    }

    // Check if product with same size already exists in cart
    const itemIndex = cart.items.findIndex(
        (p) => p.product.toString() === productId && p.size === size
    );

    const priceAtAdd = product.price - (product.price * (product.discount || 0)) / 100;

    if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
        cart.items[itemIndex].priceAtAdd = priceAtAdd;
    } else {
        cart.items.push({ product: productId, quantity, size, priceAtAdd });
    }

    await cart.save();
    return await getCartService(userId);
};

/**
 * Update quantity or size of a cart item
 */
export const updateCartItemService = async (userId, productId, quantity, size) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const itemIndex = cart.items.findIndex(
        (p) => p.product.toString() === productId && p.size === size
    );

    if (itemIndex === -1) {
        throw new ApiError(404, "Item not found in cart");
    }

    // Verify stock
    const product = await Product.findById(productId);
    const sizeStock = product?.sizes?.find(s => s.size === size)?.stock || 0;
    if (product && sizeStock < quantity) {
        throw new ApiError(400, `Insufficient stock. Only ${sizeStock} items available for size ${size}.`);
    }

    cart.items[itemIndex].quantity = quantity;
    if (product) {
        cart.items[itemIndex].priceAtAdd = product.price - (product.price * (product.discount || 0)) / 100;
    }
    await cart.save();
    
    return await getCartService(userId);
};

/**
 * Remove an item from the cart
 */
export const removeFromCartService = async (userId, productId, size) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    cart.items = cart.items.filter(
        (p) => !(p.product.toString() === productId && p.size === size)
    );

    await cart.save();
    return await getCartService(userId);
};

/**
 * Clear the entire cart
 */
export const clearCartService = async (userId) => {
    const cart = await Cart.findOne({ user: userId });
    if (cart) {
        cart.items = [];
        await cart.save();
    }
    return cart;
};
