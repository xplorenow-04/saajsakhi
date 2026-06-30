import axios from "axios";

class ProductApi {
    constructor() {
        this.baseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL}/api/products`;
        this.adminBaseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL}/api/admin/products`;
    }

    async listProducts(params = {}) {
        try {
            const response = await axios.get(this.baseUrl, { params, withCredentials: true });
            return { success: true, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async getProduct(slug) {
        try {
            const response = await axios.get(`${this.baseUrl}/slug/${slug}`, { withCredentials: true });
            return { success: true, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async getProductById(id) {
        try {
            const response = await axios.get(`${this.baseUrl}/${id}`, { withCredentials: true });
            return { success: true, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async getFeatured() {
        try {
            const response = await axios.get(`${this.baseUrl}/featured`, { withCredentials: true });
            return { success: true, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async getCategories() {
        try {
            const response = await axios.get(`${this.baseUrl}/categories`, { withCredentials: true });
            return { success: true, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async getSuggestions(query) {
        try {
            const response = await axios.get(`${this.baseUrl}/suggestions`, {
                params: { q: query },
                withCredentials: true
            });
            return { success: true, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async createProduct(formData) {
        try {
            const response = await axios.post(this.adminBaseUrl, formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" }
            });
            return { success: true, data: response.data.data, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async updateProduct(id, formData) {
        try {
            const response = await axios.put(`${this.adminBaseUrl}/${id}`, formData, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" }
            });
            return { success: true, data: response.data.data, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }

    async deleteProduct(id) {
        try {
            const response = await axios.delete(`${this.adminBaseUrl}/${id}`, { withCredentials: true });
            return { success: true, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message, error };
        }
    }
}

export const productApi = new ProductApi();
