import axios from "axios";

class OrderApi {
    constructor() {
        this.baseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL}/api/orders`;
    }

    async placeOrder(shippingAddress) {
        try {
            const response = await axios.post(this.baseUrl,
                { shippingAddress },
                { withCredentials: true }
            );
            return { success: true, data: response.data.data, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async placeGuestOrder(orderData) {
        try {
            const response = await axios.post(`${this.baseUrl}/guest`, orderData);
            return { success: true, data: response.data.data, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async getOrders(params = {}) {
        try {
            const response = await axios.get(this.baseUrl, { params, withCredentials: true });
            return { success: true, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async getOrder(orderId) {
        try {
            const response = await axios.get(`${this.baseUrl}/${orderId}`, { withCredentials: true });
            return { success: true, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async cancelOrder(orderId) {
        try {
            const response = await axios.post(`${this.baseUrl}/${orderId}/cancel`, {}, { withCredentials: true });
            return { success: true, data: response.data.data, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }
}

export const orderApi = new OrderApi();
