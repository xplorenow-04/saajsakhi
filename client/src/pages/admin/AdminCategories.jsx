import { useState, useEffect } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Search,
  Image
} from "lucide-react";
import toast from "react-hot-toast";
import { useManageCategories } from "../../hooks/useCategories";

export default function AdminCategories() {
  const { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory } = useManageCategories();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = categories.filter(c =>
    c.name?.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({ name: "", description: "" });
    setImageFile(null);
    setImagePreview(null);
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (category) => {
    setForm({ name: category.name, description: category.description || "" });
    setImagePreview(category.image?.url || null);
    setImageFile(null);
    setEditingId(category._id);
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Category name is required");
      return;
    }
    setSubmitting(true);

    const payload = { ...form, imageFile };
    const res = editingId
      ? await updateCategory(editingId, payload)
      : await createCategory(payload);

    if (res.success) {
      toast.success(editingId ? "Category updated" : "Category created");
      setModalOpen(false);
      resetForm();
    } else {
      toast.error(res.message || "Failed to save category");
    }
    setSubmitting(false);
  };

  const handleDelete = async (id) => {
    const res = await deleteCategory(id);
    if (res.success) {
      toast.success("Category deleted");
      setDeleteConfirm(null);
    } else {
      toast.error(res.message || "Failed to delete category");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Categories</h1>
          <p className="text-sm text-text-muted mt-0.5">Manage product categories</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gold-300 via-gold-500 to-gold-600 text-obsidian-950 font-bold transition-all text-sm shadow-[0_4px_14px_rgba(212,175,55,0.3)] hover:-translate-y-0.5"
        >
          <Plus size={16} />
          Add Category
        </button>
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full bg-surface-800 border border-surface-600 rounded-xl pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-surface-800 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-text-muted">No categories found</p>
          <button
            onClick={openCreate}
            className="mt-4 text-sm text-gold-400 hover:text-gold-300 font-medium transition-colors"
          >
            Add your first category
          </button>
        </div>
      ) : (
        <div className="bg-surface-800 border border-surface-600 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-600">
                  {["Image", "Name", "Slug", "Description", "Status", "Actions"].map((h) => (
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
                {filtered.map((category) => (
                  <tr key={category._id} className="border-b border-surface-700/50 hover:bg-surface-700/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-700 flex items-center justify-center overflow-hidden">
                        {category.image?.url ? (
                          <img src={category.image.url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Image size={16} className="text-text-muted" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-text-primary">{category.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-text-muted">{category.slug}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-text-secondary truncate max-w-[200px] block">
                        {category.description || "--"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${category.isActive
                        ? "text-success bg-success/10"
                        : "text-text-muted bg-surface-600"
                        }`}>
                        {category.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(category)}
                          className="p-1.5 text-text-muted hover:text-gold-500 hover:bg-surface-600 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(category._id)}
                          className="p-1.5 text-text-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-surface-800 border border-surface-600 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-text-primary">Delete Category</h3>
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setModalOpen(false); resetForm(); }} />
          <div className="relative bg-surface-800 border border-surface-600 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-text-primary">
                {editingId ? "Edit Category" : "Add Category"}
              </h2>
              <button
                onClick={() => { setModalOpen(false); resetForm(); }}
                className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                    className="w-full bg-surface-700 border border-surface-600 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
                    placeholder="Category name"
                  />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Description (optional)</label>
                 <textarea
                  value={form.description}
                  onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3}
                  className="w-full bg-surface-700 border border-surface-600 rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all resize-none"
                  placeholder="Category description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Image (optional)</label>
                <label className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-700 border border-surface-600 border-dashed cursor-pointer hover:border-gold-500/40 transition-colors">
                  {imagePreview ? (
                    <img src={imagePreview} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-surface-600 flex items-center justify-center">
                      <Image size={16} className="text-text-muted" />
                    </div>
                  )}
                  <span className="text-sm text-text-muted">
                    {imagePreview ? "Change image" : "Upload image"}
                  </span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
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
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-gold-300 via-gold-500 to-gold-600 text-obsidian-950 hover:brightness-110 font-bold transition-colors text-sm disabled:opacity-50 flex items-center justify-center gap-2"
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
