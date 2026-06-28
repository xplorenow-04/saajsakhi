import axios from "axios";

class OrderApi {
    constructor() {
        this.baseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/orders`;
    }

    placeOrder = async (shippingInfo) => {
        try {
            const response = await axios.post(`${this.baseUrl}/place`, shippingInfo, {
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

    getMyOrders = async () => {
        try {
            const response = await axios.get(`${this.baseUrl}/my-orders`, {
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

    getAllOrders = async (filters = {}) => {
        try {
            const response = await axios.get(`${this.baseUrl}/all`, {
                params: filters,
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

    updateOrderStatus = async (orderId, status) => {
        try {
            const response = await axios.put(`${this.baseUrl}/status/${orderId}`, {
                status
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
}

export const orderApi = new OrderApi();
