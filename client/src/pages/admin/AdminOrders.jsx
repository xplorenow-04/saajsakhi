import * as XLSX from "xlsx";
import { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  XCircle,
  Loader2,
  Filter,
  Plus,
  X,
  User,
  Phone,
  Home,
  MapPin,
  Package,
  FileDown,
  FileSpreadsheet
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/admin.api";

const statusColors = {
  pending: "text-gold-400 bg-gold-500/10 border border-gold-500/20",
  confirmed: "text-blue-400 bg-blue-400/10 border border-blue-500/20",
  processing: "text-purple-400 bg-purple-400/10 border border-purple-500/20",
  delivered: "text-emerald-400 bg-emerald-400/10 border border-emerald-500/20",
  cancelled: "text-red-400 bg-red-400/10 border border-red-500/20",
};

const statusOptions = ["pending", "confirmed", "processing", "delivered", "cancelled"];

const initialCustomer = {
  customerName: "",
  customerPhone: "",
  customerAddress: "",
  customerCity: "",
  customerPincode: "",
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [cancelConfirm, setCancelConfirm] = useState(null);

  const [manualModal, setManualModal] = useState(false);
  const [customer, setCustomer] = useState({ ...initialCustomer });
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sizeInputs, setSizeInputs] = useState({});
  const [exporting, setExporting] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  const handleExportPDF = async () => {
    setExporting(true);
    const res = await adminApi.exportOrdersPDF();
    if (!res.success) toast.error(res.message || "Failed to export PDF");
    setExporting(false);
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      const res = await adminApi.getOrders({ limit: 10000 });
      if (res.success) {
        const allOrders = res.data?.orders ?? res.data ?? [];
        const data = allOrders.map((o) => ({
          "Order ID": o.orderId || o._id?.slice(-8) || "",
          Customer: o.shippingAddress?.name || o.user?.name || "N/A",
          Email: o.user?.email || "",
          Phone: o.shippingAddress?.phone || o.user?.phone || "",
          Items: o.orderedProducts?.length ?? o.items?.length ?? 0,
          "Total (₹)": o.finalAmount || 0,
          Status: o.orderStatus || "pending",
          Date: o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-IN") : "--",
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Orders");
        XLSX.writeFile(wb, `orders-${Date.now()}.xlsx`);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to export Excel");
    }
    setExportingExcel(false);
  };

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

  const searchProducts = useCallback(async (query) => {
    if (!query.trim()) {
      setProductResults([]);
      return;
    }
    setSearchingProducts(true);
    const res = await adminApi.getProducts({ search: query, limit: 10 });
    if (res.success) {
      const products = res.data?.products ?? res.data ?? [];
      setProductResults(products);
    }
    setSearchingProducts(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (productSearch.trim()) searchProducts(productSearch);
      else setProductResults([]);
    }, 300);
    return () => clearTimeout(timer);
  }, [productSearch, searchProducts]);

  const addProduct = (product) => {
    if (selectedProducts.find((p) => p._id === product._id)) {
      toast.error("Product already added");
      return;
    }
    setSelectedProducts((prev) => [...prev, { ...product, quantity: 1, size: "" }]);
    setProductSearch("");
    setProductResults([]);
  };

  const removeSelectedProduct = (id) => {
    setSelectedProducts((prev) => prev.filter((p) => p._id !== id));
  };

  const updateSelectedProduct = (id, field, value) => {
    setSelectedProducts((prev) =>
      prev.map((p) => (p._id === id ? { ...p, [field]: value } : p))
    );
  };

  const resetManualForm = () => {
    setCustomer({ ...initialCustomer });
    setSelectedProducts([]);
    setProductSearch("");
    setProductResults([]);
    setSizeInputs({});
  };

  const openManualModal = () => {
    resetManualForm();
    setManualModal(true);
  };

  const handleCreateManualOrder = async (e) => {
    e.preventDefault();
    if (!customer.customerName || !customer.customerPhone || !customer.customerAddress || !customer.customerCity || !customer.customerPincode) {
      toast.error("All customer fields are required");
      return;
    }
    if (selectedProducts.length === 0) {
      toast.error("Add at least one product");
      return;
    }
    for (const p of selectedProducts) {
      if (!p.size) { toast.error(`Select size for ${p.name}`); return; }
    }

    setSubmitting(true);
    const res = await adminApi.createManualOrder({
      ...customer,
      products: selectedProducts.map((p) => ({
        productId: p._id,
        size: p.size,
        quantity: p.quantity,
      })),
    });
    if (res.success) {
      toast.success(res.message || "Manual order created");
      setManualModal(false);
      resetManualForm();
      fetchOrders();
    } else {
      toast.error(res.message);
    }
    setSubmitting(false);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Orders</h1>
          <p className="text-sm text-text-muted mt-0.5">Manage customer orders</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPDF}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-700 text-text-secondary hover:text-text-primary hover:bg-surface-600 transition-all text-sm font-medium disabled:opacity-50"
          >
            <FileDown size={16} />
            {exporting ? "Exporting..." : "Export PDF"}
          </button>
          <button
            onClick={handleExportExcel}
            disabled={exportingExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-700 text-text-secondary hover:text-text-primary hover:bg-surface-600 transition-all text-sm font-medium disabled:opacity-50"
          >
            <FileSpreadsheet size={16} />
            {exportingExcel ? "Exporting..." : "Export Excel"}
          </button>
          <button
            onClick={openManualModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-300 via-gold-500 to-gold-600 text-obsidian-950 font-bold transition-all text-sm shadow-[0_4px_14px_rgba(212,175,55,0.3)] hover:-translate-y-0.5"
          >
            <Plus size={16} />
            Create Manual Order
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by Order ID..."
            className="w-full bg-surface-800 border border-surface-600 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
          />
        </div>
        <div className="relative">
          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="bg-surface-800 border border-surface-600 rounded-xl pl-9 pr-8 py-2.5 text-sm text-text-primary focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all appearance-none cursor-pointer"
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
                          className="bg-surface-700 border border-surface-600 rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-gold-500 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s} className="capitalize">{s}</option>
                          ))}
                        </select>
                        {updatingId === order._id && (
                          <Loader2 size={14} className="animate-spin text-gold-400" />
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
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-700 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-700 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
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

      {/* Create Manual Order Modal */}
      {manualModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 px-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setManualModal(false)} />
          <div className="relative bg-surface-800 border border-surface-600 rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-600">
              <h2 className="text-lg font-semibold text-text-primary">Create Manual Order</h2>
              <button
                onClick={() => { setManualModal(false); resetManualForm(); }}
                className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateManualOrder} className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <User size={16} className="text-gold-400" />
                  Customer Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={customer.customerName}
                      onChange={(e) => setCustomer((p) => ({ ...p, customerName: e.target.value }))}
                      className="w-full bg-surface-700 border border-surface-600 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                      placeholder="Customer name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Phone</label>
                    <input
                      type="tel"
                      value={customer.customerPhone}
                      onChange={(e) => setCustomer((p) => ({ ...p, customerPhone: e.target.value }))}
                      maxLength={10}
                      className="w-full bg-surface-700 border border-surface-600 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                      placeholder="9876543210"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">City</label>
                    <input
                      type="text"
                      value={customer.customerCity}
                      onChange={(e) => setCustomer((p) => ({ ...p, customerCity: e.target.value }))}
                      className="w-full bg-surface-700 border border-surface-600 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                      placeholder="Mumbai"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Pincode</label>
                    <input
                      type="text"
                      value={customer.customerPincode}
                      onChange={(e) => setCustomer((p) => ({ ...p, customerPincode: e.target.value }))}
                      maxLength={6}
                      className="w-full bg-surface-700 border border-surface-600 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                      placeholder="400001"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">Address</label>
                    <textarea
                      value={customer.customerAddress}
                      onChange={(e) => setCustomer((p) => ({ ...p, customerAddress: e.target.value }))}
                      rows={2}
                      className="w-full bg-surface-700 border border-surface-600 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all resize-none"
                      placeholder="Street, building, area..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center gap-2">
                  <Package size={16} className="text-gold-400" />
                  Products
                </h3>

                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full bg-surface-700 border border-surface-600 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                  />
                  {searchingProducts && (
                    <Loader2 size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gold-400 animate-spin" />
                  )}
                </div>

                {productResults.length > 0 && (
                  <div className="mb-3 bg-surface-700 border border-surface-600 rounded-xl max-h-48 overflow-y-auto">
                    {productResults.map((product) => (
                      <button
                        key={product._id}
                        type="button"
                        onClick={() => addProduct(product)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-surface-600 transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-surface-600 overflow-hidden shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]?.url || product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">N/A</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-primary truncate">{product.name}</p>
                          <p className="text-xs text-text-muted">₹{product.price} | {product.category}</p>
                        </div>
                        <Plus size={16} className="text-gold-400 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {selectedProducts.length > 0 && (
                  <div className="space-y-2">
                    {selectedProducts.map((product) => (
                      <div key={product._id} className="flex items-center gap-3 bg-surface-700 rounded-xl px-4 py-3">
                        <div className="w-10 h-10 rounded-lg bg-surface-600 overflow-hidden shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]?.url || product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">N/A</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-primary truncate">{product.name}</p>
                          <p className="text-xs text-text-muted">₹{product.price}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={product.size}
                            onChange={(e) => updateSelectedProduct(product._id, "size", e.target.value)}
                            className="bg-surface-600 border border-surface-500 rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-gold-500 transition-colors cursor-pointer"
                          >
                            <option value="">Size</option>
                            {product.sizes?.map((s) => (
                              <option key={s.size} value={s.size} disabled={s.stock === 0}>
                                {s.size} {s.stock === 0 ? "(out)" : ""}
                              </option>
                            ))}
                          </select>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => updateSelectedProduct(product._id, "quantity", Math.max(1, product.quantity - 1))}
                              className="w-7 h-7 rounded-lg bg-surface-600 text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center"
                            >
                              -
                            </button>
                            <span className="w-7 text-center text-sm text-text-primary">{product.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateSelectedProduct(product._id, "quantity", product.quantity + 1)}
                              className="w-7 h-7 rounded-lg bg-surface-600 text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeSelectedProduct(product._id)}
                            className="p-1.5 text-text-muted hover:text-danger transition-colors"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setManualModal(false); resetManualForm(); }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-surface-700 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-300 via-gold-500 to-gold-600 text-obsidian-950 hover:brightness-110 font-bold transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {submitting ? "Creating..." : "Create Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
