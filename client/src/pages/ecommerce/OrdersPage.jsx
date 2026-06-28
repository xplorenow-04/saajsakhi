import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ChevronDown,
  ChevronUp,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  MapPin,
  CreditCard,
} from "lucide-react";
import toast from "react-hot-toast";
import { orderApi } from "../../api/order.api";
import Navbar from "../../components/ecommerce/Navbar";
import Footer from "../../components/ecommerce/Footer";
import LoadingSkeleton from "../../components/ecommerce/LoadingSkeleton";
import EmptyState from "../../components/ecommerce/EmptyState";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' fill='%23333'%3E%3Crect width='60' height='60'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666' font-size='8'%3ENo%3C/text%3E%3C/svg%3E";

const statusConfig = {
  pending: { label: "Pending", color: "text-warning bg-warning/10 border-warning/20" },
  confirmed: { label: "Confirmed", color: "text-accent bg-accent/10 border-accent/20" },
  shipped: { label: "Shipped", color: "text-accent bg-accent/10 border-accent/20" },
  delivered: { label: "Delivered", color: "text-success bg-success/10 border-success/20" },
  cancelled: { label: "Cancelled", color: "text-danger bg-danger/10 border-danger/20" },
};

const cancelableStatuses = ["pending", "confirmed"];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  const fetchOrders = async (pageNum) => {
    setLoading(true);
    try {
      const res = await orderApi.getOrders({ page: pageNum, limit: 10 });
      if (res.success) {
        const data = res.data;
        if (Array.isArray(data)) {
          setOrders(data);
          setTotalPages(1);
          setTotalOrders(data.length);
        } else {
          setOrders(data.orders || []);
          setTotalPages(data.totalPages || 1);
          setTotalOrders(data.total || 0);
        }
      } else {
        toast.error(res.message || "Failed to load orders");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(page);
  }, [page]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(orderId);
    try {
      const res = await orderApi.cancelOrder(orderId);
      if (res.success) {
        toast.success("Order cancelled");
        setOrders((prev) =>
          prev.map((o) =>
            (o._id || o.orderId) === orderId
              ? { ...o, status: "cancelled" }
              : o
          )
        );
      } else {
        toast.error(res.message || "Failed to cancel order");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface-900">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              My Orders
            </h1>
            {!loading && (
              <p className="text-sm text-text-muted mt-1">
                {totalOrders} order{totalOrders !== 1 ? "s" : ""} placed
              </p>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              <LoadingSkeleton type="list" count={4} />
            </div>
          ) : orders.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No orders yet"
              description="You haven't placed any orders yet. Start shopping to see your orders here."
              actionLabel="Start Shopping"
              actionLink="/shop"
            />
          ) : (
            <>
              <div className="space-y-4">
                {orders.map((order) => {
                  const orderId = order._id || order.orderId;
                  const isExpanded = expandedOrder === orderId;
                  const items = order.items || [];
                  const totalAmount =
                    order.totalAmount || order.total || 0;
                  const status =
                    (order.status || "pending").toLowerCase();
                  const statusStyling =
                    statusConfig[status] || statusConfig.pending;

                  return (
                    <div
                      key={orderId}
                      className="bg-surface-800 border border-surface-700/50 rounded-2xl overflow-hidden transition-all duration-300"
                    >
                      {/* Order Header */}
                      <div
                        onClick={() =>
                          setExpandedOrder(isExpanded ? null : orderId)
                        }
                        className="p-4 sm:p-6 cursor-pointer hover:bg-surface-700/30 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                          {/* Order Icon */}
                          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                            <Package size={20} className="text-accent" />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                              <p className="text-sm font-medium text-text-primary truncate">
                                Order #{orderId?.slice(-8).toUpperCase()}
                              </p>
                              <span
                                className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                                  statusStyling.color
                                } w-fit`}
                              >
                                {statusStyling.label}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                              <span className="text-xs text-text-muted flex items-center gap-1">
                                <Clock size={12} />
                                {formatDate(order.createdAt)}
                              </span>
                              <span className="text-xs text-text-muted">
                                {items.length} item{items.length !== 1 ? "s" : ""}
                              </span>
                              <span className="text-sm font-semibold text-accent">
                                {formatPrice(totalAmount)}
                              </span>
                            </div>
                          </div>

                          {/* Expand Icon */}
                          <button className="text-text-muted hover:text-accent transition-colors">
                            {isExpanded ? (
                              <ChevronUp size={20} />
                            ) : (
                              <ChevronDown size={20} />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="border-t border-surface-700/50 animate-slide-down">
                          <div className="p-4 sm:p-6 space-y-5">
                            {/* Items */}
                            <div className="space-y-3">
                              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                                Items
                              </h4>
                              {items.map((item, idx) => {
                                const product = item.product || item;
                                const imageUrl =
                                  product.images?.[0]?.url ||
                                  product.images?.[0] ||
                                  fallbackImage;
                                const price =
                                  item.price || product.price || 0;
                                return (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-3"
                                  >
                                    <div className="w-12 h-14 rounded-lg overflow-hidden bg-surface-700 shrink-0">
                                      <img
                                        src={imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.src = fallbackImage;
                                        }}
                                      />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm text-text-primary truncate">
                                        {product.name}
                                      </p>
                                      <p className="text-xs text-text-muted">
                                        Qty: {item.quantity}
                                        {item.size &&
                                          ` | Size: ${item.size}`}
                                      </p>
                                    </div>
                                    <p className="text-sm font-medium text-accent">
                                      {formatPrice(price * item.quantity)}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Shipping Address */}
                            {order.shippingAddress && (
                              <div>
                                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
                                  <span className="flex items-center gap-1">
                                    <MapPin size={12} />
                                    Shipping Address
                                  </span>
                                </h4>
                                <p className="text-sm text-text-secondary">
                                  {order.shippingAddress.fullName}
                                  <br />
                                  {order.shippingAddress.address}
                                  <br />
                                  {order.shippingAddress.city} -{" "}
                                  {order.shippingAddress.pincode}
                                  <br />
                                  Phone: {order.shippingAddress.phone}
                                </p>
                              </div>
                            )}

                            {/* Payment & Totals */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-surface-700/50">
                              <div className="flex items-center gap-2 text-xs text-text-muted">
                                <CreditCard size={12} />
                                <span>
                                  {order.paymentMethod || "COD"}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-text-muted">
                                  Total:
                                </span>
                                <span className="text-base font-bold text-accent">
                                  {formatPrice(totalAmount)}
                                </span>
                              </div>
                            </div>

                            {/* Cancel Button */}
                            {cancelableStatuses.includes(status) && (
                              <div className="pt-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelOrder(orderId);
                                  }}
                                  disabled={cancelling === orderId}
                                  className="flex items-center gap-1.5 text-sm text-danger hover:text-danger/80 transition-colors disabled:opacity-50"
                                >
                                  <XCircle size={16} />
                                  {cancelling === orderId
                                    ? "Cancelling..."
                                    : "Cancel Order"}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="w-10 h-10 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {Array.from(
                    { length: Math.min(totalPages, 5) },
                    (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setPage(pageNum)}
                          className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                            page === pageNum
                              ? "bg-accent text-white shadow-lg shadow-accent/25"
                              : "bg-surface-800 border border-surface-700 text-text-muted hover:text-accent hover:border-accent/50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={() =>
                      setPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={page >= totalPages}
                    className="w-10 h-10 rounded-xl bg-surface-800 border border-surface-700 flex items-center justify-center text-text-muted hover:text-accent hover:border-accent/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
