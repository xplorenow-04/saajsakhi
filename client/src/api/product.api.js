import axios from "axios";

class ProductApi {
    constructor() {
        this.baseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/products`;
    }

    getProducts = async (filters = {}) => {
        try {
            const response = await axios.get(this.baseUrl, {
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

    getFeaturedProducts = async () => {
        try {
            const response = await axios.get(`${this.baseUrl}/featured`, {
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

    getProductById = async (id) => {
        try {
            const response = await axios.get(`${this.baseUrl}/${id}`, {
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

    createProduct = async (formData) => {
        try {
            const response = await axios.post(this.baseUrl, formData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data"
                }
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

    updateProduct = async (id, formData) => {
        try {
            const response = await axios.put(`${this.baseUrl}/${id}`, formData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "multipart/form-data"
                }
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

    deleteProduct = async (id) => {
        try {
            const response = await axios.delete(`${this.baseUrl}/${id}`, {
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

export const productApi = new ProductApi();
