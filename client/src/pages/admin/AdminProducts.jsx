import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  Package
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/admin.api";
import { productApi } from "../../api/product.api";
import { useManageCategories } from "../../hooks/useCategories";

const emptyProduct = {
  name: "",
  description: "",
  category: "",
  price: "",
  discount: "0",
  sizes: [],
  images: [],
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ ...emptyProduct });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [sizeInput, setSizeInput] = useState({ size: "", stock: "" });
  const { categories, fetchCategories } = useManageCategories();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const res = await adminApi.getProducts({ page, search });
    if (res.success) {
      setProducts(res.data?.products ?? res.data ?? []);
      setTotalPages(res.data?.pagination?.totalPages ?? 1);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const resetForm = () => {
    setForm({ ...emptyProduct });
    setImageFiles([]);
    setImagePreviews([]);
    setEditingId(null);
    setSizeInput({ size: "", stock: "" });
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      price: product.price?.toString() || "",
      discount: product.discount?.toString() || "0",
      sizes: product.sizes?.map((s) => ({ size: s.size, stock: s.stock })) || [],
      images: product.images || [],
    });
    setImageFiles([]);
    setImagePreviews(product.images?.map((img) => ({ url: img.url, existing: true })) || []);
    setEditingId(product._id);
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = files.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      existing: false,
    }));
    setImageFiles((prev) => [...prev, ...files]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removePreview = (idx) => {
    const preview = imagePreviews[idx];
    if (!preview.existing) {
      URL.revokeObjectURL(preview.url);
    }
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = async (productId, imageUrl) => {
    // Optimistically remove from previews
    setImagePreviews((prev) => prev.filter((p) => p.url !== imageUrl));
  };

  const addSize = () => {
    if (!sizeInput.size.trim() || !sizeInput.stock) return;
    setForm((prev) => ({
      ...prev,
      sizes: [...prev.sizes, { size: sizeInput.size.trim(), stock: Number(sizeInput.stock) }],
    }));
    setSizeInput({ size: "", stock: "" });
  };

  const removeSize = (idx) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      toast.error("Name, price, and category are required");
      return;
    }
    setSubmitting(true);

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("category", form.category);
    formData.append("price", form.price);
    formData.append("discount", form.discount);
    formData.append("sizes", JSON.stringify(form.sizes));

    imageFiles.forEach((file) => formData.append("images", file));

    const res = editingId
      ? await productApi.updateProduct(editingId, formData)
      : await productApi.createProduct(formData);

    if (res.success) {
      toast.success(res.message);
      setModalOpen(false);
      resetForm();
      fetchProducts();
    } else {
      toast.error(res.message);
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    const res = await productApi.deleteProduct(id);
    if (res.success) {
      toast.success(res.message);
      setDeleteConfirm(null);
      fetchProducts();
    } else {
      toast.error(res.message);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    const res = await adminApi.seedProducts();
    if (res.success) {
      toast.success(res.message || "Products seeded");
      fetchProducts();
    } else {
      toast.error(res.message);
    }
    setSeeding(false);
  };

  const handleToggleActive = async (product) => {
    const formData = new FormData();
    formData.append("isActive", !product.isActive);
    const res = await productApi.updateProduct(product._id, formData);
    if (res.success) {
      toast.success(res.message);
      fetchProducts();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Products</h1>
          <p className="text-sm text-text-muted mt-0.5">Manage your product catalog</p>
        </div>
        <div className="flex items-center gap-3">
          {/* <button
            onClick={handleSeed}
            disabled={seeding}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-800 border border-surface-600 text-text-secondary hover:text-text-primary hover:border-surface-500 transition-all text-sm font-medium disabled:opacity-50"
          >
            <Package size={16} className={seeding ? "animate-spin" : ""} />
            {seeding ? "Seeding..." : "Seed Products"}
          </button> */}
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-white hover:bg-accent/90 transition-all text-sm font-medium shadow-lg shadow-accent/20"
          >
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search products..."
          className="w-full max-w-xs bg-surface-800 border border-surface-600 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-surface-800 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <PackageIcon className="mx-auto h-12 w-12 text-text-muted/40 mb-4" />
          <p className="text-text-muted">No products found</p>
          <button
            onClick={openCreate}
            className="mt-4 text-sm text-accent hover:text-accent-light transition-colors"
          >
            Add your first product
          </button>
        </div>
      ) : (
        <div className="bg-surface-800 border border-surface-600 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-600">
                  {["Image", "Name", "Category", "Price", "Discount", "Stock", "Status", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-text-muted uppercase tracking-wider px-4 py-3"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b border-surface-700/50 hover:bg-surface-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-700 overflow-hidden">
                        {product.images?.[0] ? (
                          <img src={product.images[0].url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon size={16} className="text-text-muted" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-text-primary truncate max-w-[180px]">
                        {product.name}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-text-secondary capitalize">{product.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-text-primary">${product.price?.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3">
                      {product.discount > 0 ? (
                        <span className="text-xs font-medium text-success">{product.discount}%</span>
                      ) : (
                        <span className="text-xs text-text-muted">--</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium ${product.totalStock > 10 ? "text-success" : product.totalStock > 0 ? "text-warning" : "text-danger"
                        }`}>
                        {product.totalStock ?? "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${product.isActive
                        ? "text-success bg-success/10"
                        : "text-text-muted bg-surface-600"
                        }`}>
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(product)}
                          className="p-1.5 text-text-muted hover:text-accent hover:bg-surface-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(product._id)}
                          className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(product)}
                          className="p-1.5 text-text-muted hover:text-accent hover:bg-surface-600 rounded-lg transition-colors"
                          title={product.isActive ? "Deactivate" : "Activate"}
                        >
                          {product.isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
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

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-surface-800 border border-surface-600 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-text-primary">Delete Product</h3>
            <p className="text-sm text-text-muted mt-2">Are you sure? This cannot be undone.</p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 rounded-xl bg-surface-700 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 rounded-xl bg-danger text-white hover:bg-danger/90 transition-colors text-sm font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 pb-10 px-4 overflow-y-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-surface-800 border border-surface-600 rounded-2xl w-full max-w-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-600">
              <h2 className="text-lg font-semibold text-text-primary">
                {editingId ? "Edit Product" : "Add Product"}
              </h2>
              <button
                onClick={() => { setModalOpen(false); resetForm(); }}
                className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full bg-surface-700 border border-surface-600 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                    placeholder="Product name"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    rows={3}
                    className="w-full bg-surface-700 border border-surface-600 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
                    placeholder="Product description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full bg-surface-700 border border-surface-600 rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c.name} className="capitalize">{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                    className="w-full bg-surface-700 border border-surface-600 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Discount (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.discount}
                    onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))}
                    className="w-full bg-surface-700 border border-surface-600 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Sizes</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={sizeInput.size}
                    onChange={(e) => setSizeInput((p) => ({ ...p, size: e.target.value }))}
                    placeholder="e.g. M"
                    className="flex-1 bg-surface-700 border border-surface-600 rounded-xl px-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                  <input
                    type="number"
                    value={sizeInput.stock}
                    onChange={(e) => setSizeInput((p) => ({ ...p, stock: e.target.value }))}
                    placeholder="Stock"
                    className="w-24 bg-surface-700 border border-surface-600 rounded-xl px-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={addSize}
                    className="px-3 py-2 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors text-sm"
                  >
                    Add
                  </button>
                </div>
                {form.sizes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {form.sizes.map((s, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-700 text-sm text-text-secondary"
                      >
                        {s.size} ({s.stock})
                        <button type="button" onClick={() => removeSize(i)} className="text-text-muted hover:text-danger transition-colors">
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Images</label>
                <label className="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-surface-600 rounded-xl bg-surface-700/30 cursor-pointer hover:border-accent/50 hover:bg-surface-700/50 transition-all">
                  <Upload size={20} className="text-text-muted" />
                  <span className="text-sm text-text-muted">Click to upload images</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-3">
                    {imagePreviews.map((preview, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                        <img src={preview.url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePreview(i)}
                          className="absolute top-1 right-1 p-0.5 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setModalOpen(false); resetForm(); }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-surface-700 text-text-secondary hover:text-text-primary transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-accent text-white hover:bg-accent/90 transition-colors text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {editingId ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PackageIcon(props) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
  );
}
