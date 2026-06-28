import { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  XCircle,
  Loader2,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/admin.api";

const statusColors = {
  pending: "text-warning bg-warning/10",
  confirmed: "text-blue-400 bg-blue-400/10",
  processing: "text-purple-400 bg-purple-400/10",
  delivered: "text-success bg-success/10",
  cancelled: "text-danger bg-danger/10",
};

const statusOptions = ["pending", "confirmed", "processing", "delivered", "cancelled"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;

    const res = await adminApi.getOrders(params);
    if (res.success) {
      const data = res.data;
      setOrders(data?.orders ?? data ?? []);
      setTotalPages(data?.pagination?.totalPages ?? 1);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    const res = await adminApi.updateOrderStatus(orderId, newStatus);
    if (res.success) {
      toast.success(res.message || "Status updated");
      fetchOrders();
    } else {
      toast.error(res.message);
    }
    setUpdatingId(null);
  };

  const handleDelete = async (id) => {
    const res = await adminApi.deleteOrder(id);
    if (res.success) {
      toast.success(res.message || "Order deleted");
      setCancelConfirm(null);
      fetchOrders();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Orders</h1>
        <p className="text-sm text-text-muted mt-0.5">Manage customer orders</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by Order ID..."
            className="w-full bg-surface-800 border border-surface-600 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-surface-800 border border-surface-600 rounded-xl pl-9 pr-8 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all appearance-none cursor-pointer"
          >
            <option value="">All Status</option>
            {statusOptions.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-surface-800 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <Eye className="mx-auto h-12 w-12 text-text-muted/40 mb-4" />
          <p className="text-text-muted">No orders found</p>
        </div>
      ) : (
        <div className="bg-surface-800 border border-surface-600 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-600">
                  {["Order ID", "Customer", "Items", "Total", "Status", "Date", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b border-surface-700/50 hover:bg-surface-700/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-text-muted">
                        #{order._id?.slice(-8)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-text-primary truncate max-w-[140px]">
                        {order.shippingAddress?.name || order.user?.name || "N/A"}
                      </p>
                      <p className="text-xs text-text-muted truncate max-w-[140px]">
                        {order.user?.email || ""}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-text-secondary">
                        {order.orderedProducts?.length ?? order.items?.length ?? 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-text-primary">
                        ₹{order.finalAmount?.toFixed(2) ?? "0.00"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${
                          statusColors[order.orderStatus] || "text-text-muted bg-surface-600"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-text-muted">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : "--"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleStatusUpdate(order.orderId, e.target.value)}
                          disabled={updatingId === order._id}
                          className="bg-surface-700 border border-surface-600 rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-accent transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s} className="capitalize">{s}</option>
                          ))}
                        </select>
                        {updatingId === order._id && (
                          <Loader2 size={14} className="animate-spin text-accent" />
                        )}
                        <button
                          onClick={() => setCancelConfirm(order._id)}
                          className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                          title="Cancel/Delete Order"
                        >
                          <XCircle size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-surface-600">
              <span className="text-sm text-text-muted">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-600 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-600 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cancel Confirmation */}
      {cancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCancelConfirm(null)} />
          <div className="relative bg-surface-800 border border-surface-600 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-text-primary">Delete Order</h3>
            <p className="text-sm text-text-muted mt-2">Are you sure you want to delete this order? This action cannot be undone.</p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setCancelConfirm(null)}
                className="flex-1 px-4 py-2 rounded-xl bg-surface-700 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
              >
                Keep
              </button>
              <button
                onClick={() => handleDelete(cancelConfirm)}
                className="flex-1 px-4 py-2 rounded-xl bg-danger text-white hover:bg-danger/90 transition-colors text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
