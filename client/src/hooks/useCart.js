import { useState, useCallback } from "react";
import { cartApi } from "../api/cart.api";
import toast from "react-hot-toast";

export function useCart() {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchCart = useCallback(async () => {
        setLoading(true);
        try {
            const response = await cartApi.getCart();
            if (response.success) {
                setCart(response.data);
            }
        } catch (err) {
            // silent
        } finally {
            setLoading(false);
        }
    }, []);

    const addToCart = useCallback(async (productId, size, quantity = 1) => {
        setLoading(true);
        try {
            const response = await cartApi.addToCart(productId, size, quantity);
            if (response.success) {
                setCart(response.data);
                toast.success("Added to cart");
                return { success: true };
            }
            toast.error(response.message || "Failed to add to cart");
            return { success: false, message: response.message };
        } catch (err) {
            toast.error("Failed to add to cart");
            return { success: false, message: "Failed to add to cart" };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateQuantity = useCallback(async (itemId, quantity) => {
        try {
            const response = await cartApi.updateCartItem(itemId, quantity);
            if (response.success) {
                setCart(response.data);
                return { success: true };
            }
            return { success: false, message: response.message };
        } catch (err) {
            return { success: false, message: "Failed to update cart" };
        }
    }, []);

    const removeFromCart = useCallback(async (itemId) => {
        setLoading(true);
        try {
            const response = await cartApi.removeFromCart(itemId);
            if (response.success) {
                setCart(response.data);
                toast.success("Removed from cart");
                return { success: true };
            }
            toast.error(response.message || "Failed to remove item");
            return { success: false, message: response.message };
        } catch (err) {
            toast.error("Failed to remove item");
            return { success: false, message: "Failed to remove item" };
        } finally {
            setLoading(false);
        }
    }, []);

    const clearCart = useCallback(async () => {
        setLoading(true);
        try {
            const response = await cartApi.clearCart();
            if (response.success) {
                setCart({ items: [] });
                toast.success("Cart cleared");
                return { success: true };
            }
            return { success: false, message: response.message };
        } catch (err) {
            return { success: false, message: "Failed to clear cart" };
        } finally {
            setLoading(false);
        }
    }, []);

    return { cart, loading, fetchCart, addToCart, updateQuantity, removeFromCart, clearCart };
}
