import axios from "axios";

class CartApi {
    constructor() {
        this.baseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/cart`;
    }

    getCart = async () => {
        try {
            const response = await axios.get(this.baseUrl, {
                withCredentials: true
            });
            return {
                success: true,
                message: response.data.message,
                data: response.data.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message,
                error: error
            };
        }
    };

    addToCart = async (productId, quantity, size) => {
        try {
            const response = await axios.post(`${this.baseUrl}/add`, {
                productId,
                quantity,
                size
            }, {
                withCredentials: true
            });
            return {
                success: true,
                message: response.data.message,
                data: response.data.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message,
                error: error
            };
        }
    };

    updateCartItem = async (productId, quantity, size) => {
        try {
            const response = await axios.put(`${this.baseUrl}/update`, {
                productId,
                quantity,
                size
            }, {
                withCredentials: true
            });
            return {
                success: true,
                message: response.data.message,
                data: response.data.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message,
                error: error
            };
        }
    };

    removeFromCart = async (productId, size) => {
        try {
            const response = await axios.delete(`${this.baseUrl}/remove/${productId}/${size}`, {
                withCredentials: true
            });
            return {
                success: true,
                message: response.data.message,
                data: response.data.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message,
                error: error
            };
        }
    };

    clearCart = async () => {
        try {
            const response = await axios.delete(`${this.baseUrl}/clear`, {
                withCredentials: true
            });
            return {
                success: true,
                message: response.data.message,
                data: response.data.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || error.message,
                error: error
            };
        }
    };
}

export const cartApi = new CartApi();
