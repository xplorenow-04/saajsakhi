import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { cartApi } from "../api/cart.api.js";
import { productApi } from "../api/product.api.js";

export const useShopStore = create(
    devtools(
        (set, get) => ({
            // CART STATE
            cart: { items: [] },
            cartLoading: false,
            cartError: null,

            fetchCart: async () => {
                set({ cartLoading: true, cartError: null });
                const res = await cartApi.getCart();
                if (res.success) {
                    set({ cart: res.data, cartLoading: false });
                } else {
                    set({ cartError: res.message, cartLoading: false });
                }
            },

            addToCart: async (productId, quantity, size) => {
                set({ cartLoading: true, cartError: null });
                const res = await cartApi.addToCart(productId, quantity, size);
                if (res.success) {
                    set({ cart: res.data, cartLoading: false });
                    return { success: true, message: "Item added to cart" };
                } else {
                    set({ cartError: res.message, cartLoading: false });
                    return { success: false, message: res.message };
                }
            },

            updateCartItem: async (productId, quantity, size) => {
                set({ cartLoading: true, cartError: null });
                const res = await cartApi.updateCartItem(productId, quantity, size);
                if (res.success) {
                    set({ cart: res.data, cartLoading: false });
                    return { success: true };
                } else {
                    set({ cartError: res.message, cartLoading: false });
                    return { success: false, message: res.message };
                }
            },

            removeFromCart: async (productId, size) => {
                set({ cartLoading: true, cartError: null });
                const res = await cartApi.removeFromCart(productId, size);
                if (res.success) {
                    set({ cart: res.data, cartLoading: false });
                    return { success: true };
                } else {
                    set({ cartError: res.message, cartLoading: false });
                    return { success: false, message: res.message };
                }
            },

            clearCart: async () => {
                set({ cartLoading: true, cartError: null });
                const res = await cartApi.clearCart();
                if (res.success) {
                    set({ cart: { items: [] }, cartLoading: false });
                } else {
                    set({ cartError: res.message, cartLoading: false });
                }
            },

            getCartCount: () => {
                const items = get().cart?.items || [];
                return items.reduce((total, item) => total + item.quantity, 0);
            },

            getCartTotal: () => {
                const items = get().cart?.items || [];
                return items.reduce((total, item) => {
                    const price = item.product?.discount > 0 
                        ? item.product.price - item.product.discount 
                        : item.product?.price || 0;
                    return total + price * item.quantity;
                }, 0);
            },

            // PRODUCT SHOP STATE
            products: [],
            featuredProducts: [],
            pagination: {
                currentPage: 1,
                totalPages: 1,
                totalProducts: 0,
                limit: 12
            },
            productsLoading: false,
            productsError: null,
            filters: {
                search: "",
                category: "",
                minPrice: "",
                maxPrice: "",
                size: "",
                discount: false,
                page: 1
            },

            setFilters: (newFilters) => {
                set((state) => ({
                    filters: { ...state.filters, ...newFilters }
                }));
            },

            resetFilters: () => {
                set({
                    filters: {
                        search: "",
                        category: "",
                        minPrice: "",
                        maxPrice: "",
                        size: "",
                        discount: false,
                        page: 1
                    }
                });
            },

            fetchProducts: async () => {
                set({ productsLoading: true, productsError: null });
                const currentFilters = get().filters;
                const res = await productApi.getProducts(currentFilters);
                if (res.success) {
                    set({ 
                        products: res.data.products, 
                        pagination: res.data.pagination, 
                        productsLoading: false 
                    });
                } else {
                    set({ productsError: res.message, productsLoading: false });
                }
            },

            fetchFeaturedProducts: async () => {
                const res = await productApi.getFeaturedProducts();
                if (res.success) {
                    set({ featuredProducts: res.data });
                }
            }
        }),
        { name: "ShopStore" }
    )
);
