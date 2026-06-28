import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Package,
  ShoppingCart,
  DollarSign,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Eye,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/admin.api";

const statCards = [
  { key: "totalUsers", label: "Total Users", icon: Users, color: "from-blue-500 to-blue-600" },
  { key: "totalProducts", label: "Total Products", icon: Package, color: "from-emerald-500 to-emerald-600" },
  { key: "totalOrders", label: "Total Orders", icon: ShoppingCart, color: "from-amber-500 to-amber-600" },
  { key: "monthlyRevenue", label: "Monthly Revenue", icon: DollarSign, prefix: "₹", color: "from-violet-500 to-violet-600" },
];

function StatSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-surface-800 border border-surface-600 animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-xl bg-surface-600" />
        <div className="w-16 h-4 rounded bg-surface-600" />
      </div>
      <div className="w-20 h-7 rounded bg-surface-600" />
      <div className="w-24 h-3 rounded bg-surface-600" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-surface-800 border border-surface-600 animate-pulse space-y-4">
      <div className="w-32 h-5 rounded bg-surface-600" />
      <div className="h-48 rounded-lg bg-surface-600" />
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [ordersByDay, setOrdersByDay] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    const [dashRes, ordersRes, productAnalyticsRes] = await Promise.all([
      adminApi.getDashboard(),
      adminApi.getOrders({ page: 1, limit: 5 }),
      adminApi.getProductAnalytics(),
    ]);

    if (dashRes.success) {
      const d = dashRes.data;
      setStats({
        totalUsers: d.totalUsers ?? 0,
        totalProducts: d.totalProducts ?? 0,
        totalOrders: d.totalOrders ?? 0,
        monthlyRevenue: d.monthlyRevenue ?? 0,
        usersChange: d.usersChange ?? 0,
        productsChange: d.productsChange ?? 0,
        ordersChange: d.ordersChange ?? 0,
        revenueChange: d.revenueChange ?? 0,
      });
      setOrdersByDay(d.ordersByDay ?? []);
    } else {
      toast.error(dashRes.message);
    }

    if (ordersRes.success) {
      setRecentOrders(ordersRes.data?.orders ?? []);
    }

    if (productAnalyticsRes.success) {
      const data = productAnalyticsRes.data;
      setTopProducts(Array.isArray(data) ? data : data?.mostViewed ?? []);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-muted mt-0.5">Overview of your store</p>
        </div>
        <button
          onClick={() => fetchData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-800 border border-surface-600 text-text-secondary hover:text-text-primary hover:border-surface-500 transition-all text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <StatSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const value = stats?.[card.key] ?? 0;
            const changeKey = card.key.replace("total", "").replace("Monthly", "").toLowerCase() + "Change";
            const change = stats?.[changeKey];
            const isPositive = change >= 0;
            const formatted = card.prefix
              ? `${card.prefix}${Number(value).toLocaleString()}`
              : Number(value).toLocaleString();

            return (
              <div
                key={card.key}
                className="relative p-5 rounded-2xl bg-surface-800 border border-surface-600 overflow-hidden group hover:border-surface-500 transition-colors"
              >
                <div className="absolute top-0 right-0 w-24 h-24 -translate-y-6 translate-x-6 rounded-full bg-gradient-to-br opacity-[0.08] group-hover:opacity-[0.12] transition-opacity blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg`}
                  >
                    <card.icon size={18} className="text-white" />
                  </div>
                  {change !== undefined && (
                    <span
                      className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                        isPositive
                          ? "text-success bg-success/10"
                          : "text-danger bg-danger/10"
                      }`}
                    >
                      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {Math.abs(change)}%
                    </span>
                  )}
                </div>
                <p className="text-2xl font-bold text-text-primary">{formatted}</p>
                <p className="text-sm text-text-muted mt-1">{card.label}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? <ChartSkeleton /> : (
          <div className="p-5 rounded-2xl bg-surface-800 border border-surface-600">
            <h2 className="text-base font-semibold text-text-primary mb-4">Orders by Day (Last 7)</h2>
            {ordersByDay.length > 0 ? (
              <div className="flex items-end gap-2 h-48">
                {ordersByDay.map((item, i) => {
                  const max = Math.max(...ordersByDay.map((o) => o.count), 1);
                  const height = (item.count / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                      <span className="text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.count}
                      </span>
                      <div
                        className="w-full rounded-lg bg-gradient-to-t from-accent to-accent-light transition-all duration-500 hover:opacity-80"
                        style={{ height: `${Math.max(height, 4)}%` }}
                      />
                      <span className="text-[10px] text-text-muted truncate w-full text-center">
                        {item.date?.slice(5) ?? `Day ${i + 1}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-text-muted text-sm">
                No order data available
              </div>
            )}
          </div>
        )}

        {loading ? <ChartSkeleton /> : (
          <div className="p-5 rounded-2xl bg-surface-800 border border-surface-600">
            <h2 className="text-base font-semibold text-text-primary mb-4">Monthly Revenue</h2>
            <div className="flex items-end gap-2 h-48">
              {(() => {
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const now = new Date();
                const data = stats?.monthlyRevenueData ?? [];
                const points = Array.from({ length: 12 }, (_, i) => {
                  const found = data.find((d) => d.month === i + 1);
                  return found?.revenue ?? 0;
                });
                const max = Math.max(...points, 1);
                return points.map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
                    <span className="text-xs text-text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                      ₹{val}
                    </span>
                    <div
                      className="w-full rounded-lg bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all duration-500 hover:opacity-80"
                      style={{ height: `${Math.max((val / max) * 100, 2)}%` }}
                    />
                    <span className="text-[10px] text-text-muted truncate w-full text-center">
                      {months[i]}
                    </span>
                  </div>
                ));
              })()}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-surface-800 border border-surface-600">
          <h2 className="text-base font-semibold text-text-primary mb-4">Recent Orders</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-surface-700 animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length > 0 ? (
            <div className="space-y-2">
              {recentOrders.slice(0, 5).map((order) => (
                <div
                  key={order._id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-surface-700/50 hover:bg-surface-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono text-text-muted truncate">
                      #{order._id?.slice(-8)}
                    </span>
                    <span className="text-sm text-text-secondary truncate">
                      {order.user?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-medium text-text-primary">
                      ₹{order.finalAmount?.toFixed(2) ?? "0.00"}
                    </span>
                    <span
                      className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        order.orderStatus === "delivered"
                          ? "text-success bg-success/10"
                          : order.orderStatus === "cancelled"
                          ? "text-danger bg-danger/10"
                          : order.orderStatus === "pending"
                          ? "text-warning bg-warning/10"
                          : order.orderStatus === "processing"
                          ? "text-purple-400 bg-purple-400/10"
                          : "text-blue-400 bg-blue-400/10"
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-text-muted text-sm">No orders yet</div>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-surface-800 border border-surface-600">
          <h2 className="text-base font-semibold text-text-primary mb-4">Most Viewed Products</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-surface-700 animate-pulse" />
              ))}
            </div>
          ) : topProducts.length > 0 ? (
            <div className="space-y-2">
              {topProducts.slice(0, 5).map((product, idx) => (
                <div
                  key={product._id || idx}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-700/50 hover:bg-surface-700 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-surface-600 flex items-center justify-center overflow-hidden shrink-0">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Eye size={16} className="text-text-muted" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-text-muted">
                      ₹{product.price?.toFixed(2)} &middot; {product.viewCount ?? 0} views
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-text-muted text-sm">
              No product data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
