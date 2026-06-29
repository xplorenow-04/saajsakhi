import { useState, useCallback } from "react";
import { adminApi } from "../api/admin.api";
import { orderApi } from "../api/order.api";
import toast from "react-hot-toast";

export function useAdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        try {
            const response = await adminApi.getDashboard();
            if (response.success) {
                setStats(response.data);
            }
        } catch (err) {
            // silent
        } finally {
            setLoading(false);
        }
    }, []);

    return { stats, loading, fetchDashboard };
}

export function useAdminOrders() {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchOrders = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const response = await adminApi.getOrders(params);
            if (response.success) {
                setOrders(response.data.orders || []);
                setPagination(response.data.pagination || null);
            }
        } catch (err) {
            // silent
        } finally {
            setLoading(false);
        }
    }, []);

    const updateStatus = useCallback(async (orderId, status) => {
        setLoading(true);
        try {
            const response = await adminApi.updateOrderStatus(orderId, status);
            if (response.success) {
                toast.success("Order status updated");
                setOrders(prev => prev.map(o =>
                    o.orderId === orderId ? { ...o, orderStatus: status } : o
                ));
                return { success: true };
            }
            toast.error(response.message || "Failed to update status");
            return { success: false, message: response.message };
        } catch (err) {
            toast.error("Failed to update status");
            return { success: false, message: "Failed to update status" };
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteOrder = useCallback(async (orderId) => {
        setLoading(true);
        try {
            const response = await adminApi.deleteOrder(orderId);
            if (response.success) {
                toast.success("Order deleted");
                setOrders(prev => prev.filter(o => o._id !== orderId));
                return { success: true };
            }
            toast.error(response.message || "Failed to delete order");
            return { success: false, message: response.message };
        } catch (err) {
            toast.error("Failed to delete order");
            return { success: false, message: "Failed to delete order" };
        } finally {
            setLoading(false);
        }
    }, []);

    const createManualOrder = useCallback(async (orderData) => {
        setLoading(true);
        try {
            const response = await adminApi.createManualOrder(orderData);
            if (response.success) {
                toast.success("Manual order created successfully");
                return { success: true, data: response.data };
            }
            toast.error(response.message || "Failed to create order");
            return { success: false, message: response.message };
        } catch (err) {
            toast.error("Failed to create order");
            return { success: false, message: "Failed to create order" };
        } finally {
            setLoading(false);
        }
    }, []);

    return { orders, pagination, loading, fetchOrders, updateStatus, deleteOrder, createManualOrder };
}

export function useAdminUsers() {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchUsers = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const response = await adminApi.getUsers(params);
            if (response.success) {
                setUsers(response.data.users || []);
                setPagination(response.data.pagination || null);
            }
        } catch (err) {
            // silent
        } finally {
            setLoading(false);
        }
    }, []);

    const toggleStatus = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await adminApi.toggleUserStatus(id);
            if (response.success) {
                toast.success("User status updated");
                setUsers(prev => prev.map(u =>
                    u._id === id ? { ...u, isDisabled: response.data.isDisabled } : u
                ));
                return { success: true };
            }
            toast.error(response.message || "Failed to update status");
            return { success: false, message: response.message };
        } catch (err) {
            toast.error("Failed to update status");
            return { success: false, message: "Failed to update status" };
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteUser = useCallback(async (id) => {
        setLoading(true);
        try {
            const response = await adminApi.deleteUser(id);
            if (response.success) {
                toast.success("User deleted");
                setUsers(prev => prev.filter(u => u._id !== id));
                return { success: true };
            }
            toast.error(response.message || "Failed to delete user");
            return { success: false, message: response.message };
        } catch (err) {
            toast.error("Failed to delete user");
            return { success: false, message: "Failed to delete user" };
        } finally {
            setLoading(false);
        }
    }, []);

    return { users, pagination, loading, fetchUsers, toggleStatus, deleteUser };
}

export function useAdminProducts() {
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchProducts = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const response = await adminApi.getProducts(params);
            if (response.success) {
                setProducts(response.data.products || []);
                setPagination(response.data.pagination || null);
            }
        } catch (err) {
            // silent
        } finally {
            setLoading(false);
        }
    }, []);

    return { products, pagination, loading, fetchProducts };
}

export function useAdminAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [productAnalytics, setProductAnalytics] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchAnalytics = useCallback(async () => {
        setLoading(true);
        try {
            const [analyticsRes, productRes] = await Promise.all([
                adminApi.getAnalytics(),
                adminApi.getProductAnalytics()
            ]);
            if (analyticsRes.success) setAnalytics(analyticsRes.data);
            if (productRes.success) setProductAnalytics(productRes.data || []);
        } catch (err) {
            // silent
        } finally {
            setLoading(false);
        }
    }, []);

    return { analytics, productAnalytics, loading, fetchAnalytics };
}

export function useAdminSeed() {
    const [loading, setLoading] = useState(false);

    const seedProducts = useCallback(async () => {
        setLoading(true);
        try {
            const response = await adminApi.seedProducts();
            if (response.success) {
                toast.success(response.message || "Products seeded successfully");
                return { success: true, data: response.data };
            }
            toast.error(response.message || "Failed to seed products");
            return { success: false, message: response.message };
        } catch (err) {
            toast.error("Failed to seed products");
            return { success: false, message: "Failed to seed products" };
        } finally {
            setLoading(false);
        }
    }, []);

    return { seedProducts, loading };
}
