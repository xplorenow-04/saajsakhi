import { useState, useCallback } from "react";
import { orderApi } from "../api/order.api";
import toast from "react-hot-toast";

export function useOrders() {
    const [orders, setOrders] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchOrders = useCallback(async (params = {}) => {
        setLoading(true);
        try {
            const response = await orderApi.getOrders(params);
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

    const placeOrder = useCallback(async (shippingAddress) => {
        setLoading(true);
        try {
            const response = await orderApi.placeOrder(shippingAddress);
            if (response.success) {
                toast.success("Order placed successfully!");
                return { success: true, data: response.data };
            }
            toast.error(response.message || "Failed to place order");
            return { success: false, message: response.message };
        } catch (err) {
            toast.error("Failed to place order");
            return { success: false, message: "Failed to place order" };
        } finally {
            setLoading(false);
        }
    }, []);

    const placeGuestOrder = useCallback(async (products, guestInfo) => {
        setLoading(true);
        try {
            const response = await orderApi.placeGuestOrder({ products, guestInfo });
            if (response.success) {
                toast.success("Order placed successfully!");
                return { success: true, data: response.data };
            }
            toast.error(response.message || "Failed to place order");
            return { success: false, message: response.message };
        } catch (err) {
            toast.error("Failed to place order");
            return { success: false, message: "Failed to place order" };
        } finally {
            setLoading(false);
        }
    }, []);

    const cancelOrder = useCallback(async (orderId) => {
        setLoading(true);
        try {
            const response = await orderApi.cancelOrder(orderId);
            if (response.success) {
                toast.success("Order cancelled successfully");
                setOrders(prev => prev.map(o =>
                    o.orderId === orderId ? { ...o, orderStatus: "cancelled" } : o
                ));
                return { success: true };
            }
            toast.error(response.message || "Failed to cancel order");
            return { success: false, message: response.message };
        } catch (err) {
            toast.error("Failed to cancel order");
            return { success: false, message: "Failed to cancel order" };
        } finally {
            setLoading(false);
        }
    }, []);

    return { orders, pagination, loading, fetchOrders, placeOrder, placeGuestOrder, cancelOrder };
}
