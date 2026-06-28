import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/apiUtils.js";
import { logger } from "../utils/logger.js";

class CartService {
    async getCart(userId) {
        let cart = await Cart.findOne({ user: userId }).populate({
            path: "items.product",
            select: "name price discount images sizes isActive"
        });

        if (!cart) {
            cart = await Cart.create({ user: userId, items: [] });
        }

        cart.items = cart.items.filter(item => {
            if (!item.product || !item.product.isActive) return false;
            const sizeData = item.product.sizes.find(s => s.size === item.size);
            return sizeData && sizeData.stock > 0;
        });

        return cart;
    }

    async addToCart(userId, productId, size, quantity = 1) {
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            throw new ApiError(404, "Product not found or unavailable");
        }

        const sizeData = product.sizes.find(s => s.size === size);
        if (!sizeData) {
            throw new ApiError(400, "Invalid size selected");
        }
        if (sizeData.stock < quantity) {
            throw new ApiError(400, `Only ${sizeData.stock} units available in size ${size}`);
        }

        let cart = await Cart.findOne({ user: userId });
        if (!cart) {
            cart = new Cart({ user: userId, items: [] });
        }

        const existingItem = cart.items.find(
            item => item.product.toString() === productId && item.size === size
        );

        if (existingItem) {
            const newQty = existingItem.quantity + quantity;
            if (newQty > sizeData.stock) {
                throw new ApiError(400, `Only ${sizeData.stock} units available in size ${size}`);
            }
            existingItem.quantity = newQty;
            existingItem.priceAtAdd = product.price;
        } else {
            cart.items.push({
                product: productId,
                size,
                quantity,
                priceAtAdd: product.price
            });
        }

        await cart.save();
        logger.info("Item added to cart", { userId, productId, size, quantity });
        return this.getCart(userId);
    }

    async updateCartItem(userId, itemId, quantity) {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) throw new ApiError(404, "Cart not found");

        const item = cart.items.id(itemId);
        if (!item) throw new ApiError(404, "Item not found in cart");

        const product = await Product.findById(item.product);
        if (!product || !product.isActive) {
            throw new ApiError(400, "Product is no longer available");
        }

        const sizeData = product.sizes.find(s => s.size === item.size);
        if (!sizeData || sizeData.stock < quantity) {
            throw new ApiError(400, `Only ${sizeData?.stock || 0} units available`);
        }

        item.quantity = quantity;
        item.priceAtAdd = product.price;
        await cart.save();

        return this.getCart(userId);
    }

    async removeFromCart(userId, itemId) {
        const cart = await Cart.findOne({ user: userId });
        if (!cart) throw new ApiError(404, "Cart not found");

        cart.items = cart.items.filter(item => item._id.toString() !== itemId);
        await cart.save();

        logger.info("Item removed from cart", { userId, itemId });
        return this.getCart(userId);
    }

    async clearCart(userId) {
        await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
        logger.info("Cart cleared", { userId });
        return { items: [] };
    }
}

export const cartService = new CartService();
