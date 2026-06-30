import axios from "axios";

class AdminApi {
    constructor() {
        this.baseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL}/api/admin`;
    }

    async getDashboard() {
        try {
            const response = await axios.get(`${this.baseUrl}/dashboard`, { withCredentials: true });
            return { success: true, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async getAnalytics() {
        try {
            const response = await axios.get(`${this.baseUrl}/analytics`, { withCredentials: true });
            return { success: true, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async getProductAnalytics() {
        try {
            const response = await axios.get(`${this.baseUrl}/product-analytics`, { withCredentials: true });
            return { success: true, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async getOrders(params = {}) {
        try {
            const response = await axios.get(`${this.baseUrl}/orders`, { params, withCredentials: true });
            return { success: true, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async updateOrderStatus(orderId, status) {
        try {
            const response = await axios.put(`${this.baseUrl}/orders/${orderId}/status`,
                { status },
                { withCredentials: true }
            );
            return { success: true, data: response.data.data, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async deleteOrder(id) {
        try {
            const response = await axios.delete(`${this.baseUrl}/orders/${id}`, { withCredentials: true });
            return { success: true, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async createManualOrder(orderData) {
        try {
            const response = await axios.post(`${this.baseUrl}/orders/manual`, orderData, { withCredentials: true });
            return { success: true, data: response.data.data, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async getUsers(params = {}) {
        try {
            const response = await axios.get(`${this.baseUrl}/users`, { params, withCredentials: true });
            return { success: true, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async toggleUserStatus(id) {
        try {
            const response = await axios.put(`${this.baseUrl}/users/${id}/toggle-status`, {}, { withCredentials: true });
            return { success: true, data: response.data.data, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async deleteUser(id) {
        try {
            const response = await axios.delete(`${this.baseUrl}/users/${id}`, { withCredentials: true });
            return { success: true, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async seedProducts() {
        try {
            const response = await axios.post(`${this.baseUrl}/seed`, {}, { withCredentials: true });
            return { success: true, data: response.data.data, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async createAdmin(data) {
        try {
            const response = await axios.post(`${this.baseUrl}/create`, data, { withCredentials: true });
            return { success: true, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async getProducts(params = {}) {
        try {
            const response = await axios.get(`${this.baseUrl}/products`, { params, withCredentials: true });
            return { success: true, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async exportOrdersPDF() {
        try {
            const response = await axios.get(`${this.baseUrl}/orders/export-pdf`, {
                responseType: "blob",
                withCredentials: true
            });
            const blob = new Blob([response.data], { type: "application/pdf" });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `orders-report-${Date.now()}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }
}

export const adminApi = new AdminApi();
