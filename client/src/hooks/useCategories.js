import { useState, useCallback, useEffect } from "react";
import axios from "axios";

const BASE_URL = `${import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BACKEND_URL_PROD : import.meta.env.VITE_BACKEND_URL}/api/categories`;

export function useManageCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${BASE_URL}?all=true`, { withCredentials: true });
            if (data.success) {
                setCategories(data.data || []);
            }
        } catch (err) {
            // silent
        } finally {
            setLoading(false);
        }
    }, []);

    const createCategory = useCallback(async (categoryData) => {
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append("name", categoryData.name);
            fd.append("description", categoryData.description || "");
            if (categoryData.imageFile) fd.append("image", categoryData.imageFile);
            const { data } = await axios.post(BASE_URL, fd, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (data.success) {
                setCategories(prev => [...prev, data.data]);
                return { success: true, data: data.data };
            }
            return { success: false, message: data.message };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to create category";
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const updateCategory = useCallback(async (id, categoryData) => {
        setLoading(true);
        try {
            const fd = new FormData();
            fd.append("name", categoryData.name);
            fd.append("description", categoryData.description || "");
            if (categoryData.imageFile) fd.append("image", categoryData.imageFile);
            const { data } = await axios.put(`${BASE_URL}/${id}`, fd, {
                withCredentials: true,
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (data.success) {
                setCategories(prev => prev.map(c => c._id === id ? data.data : c));
                return { success: true, data: data.data };
            }
            return { success: false, message: data.message };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to update category";
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteCategory = useCallback(async (id) => {
        setLoading(true);
        try {
            const { data } = await axios.delete(`${BASE_URL}/${id}`, { withCredentials: true });
            if (data.success) {
                setCategories(prev => prev.filter(c => c._id !== id));
                return { success: true };
            }
            return { success: false, message: data.message };
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to delete category";
            return { success: false, message: msg };
        } finally {
            setLoading(false);
        }
    }, []);

    return { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory };
}
