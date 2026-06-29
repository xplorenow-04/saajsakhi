import axios from "axios";

class CategoryApi {
    constructor() {
        this.baseUrl = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"}/api/categories`;
    }

    getAll = async () => {
        try {
            const response = await axios.get(this.baseUrl, { withCredentials: true });
            return { success: true, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    };

    create = async (name) => {
        try {
            const response = await axios.post(this.baseUrl, { name }, { withCredentials: true });
            return { success: true, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    };

    delete = async (id) => {
        try {
            const response = await axios.delete(`${this.baseUrl}/${id}`, { withCredentials: true });
            return { success: true, data: response.data.data };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    };
}

export const categoryApi = new CategoryApi();
