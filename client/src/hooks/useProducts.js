import { useState, useEffect, useCallback } from "react";
import { productApi } from "../api/product.api";
import toast from "react-hot-toast";

export function useProducts(initialParams = {}) {
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProducts = useCallback(async (params = {}) => {
        setLoading(true);
        setError(null);
        try {
            const response = await productApi.listProducts(params);
            if (response.success) {
                setProducts(response.data.products || []);
                setPagination(response.data.pagination || null);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError("Failed to fetch products");
        } finally {
            setLoading(false);
        }
    }, []);

    return { products, pagination, loading, error, fetchProducts };
}

export function useProduct(slug) {
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProduct = useCallback(async () => {
        if (!slug) return;
        setLoading(true);
        setError(null);
        try {
            const response = await productApi.getProduct(slug);
            if (response.success) {
                setProduct(response.data);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError("Failed to fetch product");
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchProduct();
    }, [fetchProduct]);

    return { product, loading, error, refetch: fetchProduct };
}

export function useFeaturedProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchFeatured = useCallback(async () => {
        setLoading(true);
        try {
            const response = await productApi.getFeatured();
            if (response.success) {
                setProducts(response.data || []);
            }
        } catch (err) {
            // silent fail for featured
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFeatured();
    }, [fetchFeatured]);

    return { products, loading, refetch: fetchFeatured };
}

export function useCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const response = await productApi.getCategories();
            if (response.success) {
                setCategories(response.data || []);
            }
        } catch (err) {
            // silent fail
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    return { categories, loading, refetch: fetchCategories };
}

export function useCreateProduct() {
    const [loading, setLoading] = useState(false);

    const createProduct = useCallback(async (formData) => {
        setLoading(true);
        try {
            const response = await productApi.createProduct(formData);
            if (response.success) {
                toast.success(response.message || "Product created successfully");
                return { success: true, data: response.data };
            }
            toast.error(response.message || "Failed to create product");
            return { success: false, message: response.message };
        } catch (err) {
            toast.error("Failed to create product");
            return { success: false, message: "Failed to create product" };
        } finally {
            setLoading(false);
        }
    }, []);

    return { createProduct, loading };
}

export function useUpdateProduct() {
    const [loading, setLoading] = useState(false);

    const updateProduct = useCallback(async (id, formData) => {
        setLoading(true);
        try {
            const response = await productApi.updateProduct(id, formData);
            if (response.success) {
                toast.success(response.message || "Product updated successfully");
                return { success: true, data: response.data };
            }
            toast.error(response.message || "Failed to update product");
            return { success: false, message: response.message };
        } catch (err) {
            toast.error("Failed to update product");
            return { success: false, message: "Failed to update product" };
        } finally {
            setLoading(false);
        }
    }, []);

    return { updateProduct, loading };
}

export function useDeleteProduct() {
    const [loading, setLoading] = useState(false);

    const deleteProduct = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await productApi.deleteProduct(id);
            if (response.success) {
                toast.success("Product deleted successfully");
                return { success: true };
            }
            toast.error(response.message || "Failed to delete product");
            return { success: false, message: response.message };
        } catch (err) {
            toast.error("Failed to delete product");
            return { success: false, message: "Failed to delete product" };
        } finally {
            setLoading(false);
        }
    }, []);

    return { deleteProduct, loading };
}
