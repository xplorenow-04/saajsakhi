import { create } from "zustand";
import { cartApi } from "../api/cart.api";

export const useEcommerceStore = create((set, get) => ({
    cart: null,
    cartCount: 0,
    cartLoading: false,

    fetchCart: async () => {
        set({ cartLoading: true });
        const res = await cartApi.getCart();
        if (res.success && res.data) {
            const count = res.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            set({ cart: res.data, cartCount: count, cartLoading: false });
        } else {
            set({ cartLoading: false });
        }
        return res;
    },

    addToCart: async (productId, size, quantity = 1) => {
        const res = await cartApi.addToCart(productId, size, quantity);
        if (res.success && res.data) {
            const count = res.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            set({ cart: res.data, cartCount: count });
        }
        return res;
    },

    updateCartItem: async (itemId, quantity) => {
        const res = await cartApi.updateCartItem(itemId, quantity);
        if (res.success && res.data) {
            const count = res.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            set({ cart: res.data, cartCount: count });
        }
        return res;
    },

    removeFromCart: async (itemId) => {
        const res = await cartApi.removeFromCart(itemId);
        if (res.success && res.data) {
            const count = res.data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
            set({ cart: res.data, cartCount: count });
        }
        return res;
    },

    clearCart: async () => {
        const res = await cartApi.clearCart();
        if (res.success) {
            set({ cart: { items: [] }, cartCount: 0 });
        }
        return res;
    }
}));
