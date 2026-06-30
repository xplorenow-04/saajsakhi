import axios from "axios";

class CartApi {
    constructor() {
        this.baseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL}/api/cart`;
    }

    async getCart() {
        try {
            const response = await axios.get(this.baseUrl, { withCredentials: true });
            return { success: true, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async addToCart(productId, size, quantity = 1) {
        try {
            const response = await axios.post(this.baseUrl,
                { productId, size, quantity },
                { withCredentials: true }
            );
            return { success: true, data: response.data.data, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async updateCartItem(itemId, quantity) {
        try {
            const response = await axios.put(`${this.baseUrl}/${itemId}`,
                { quantity },
                { withCredentials: true }
            );
            return { success: true, data: response.data.data, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async removeFromCart(itemId) {
        try {
            const response = await axios.delete(`${this.baseUrl}/${itemId}`, { withCredentials: true });
            return { success: true, data: response.data.data, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async clearCart() {
        try {
            const response = await axios.delete(this.baseUrl, { withCredentials: true });
            return { success: true, data: response.data.data, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }
}

export const cartApi = new CartApi();
