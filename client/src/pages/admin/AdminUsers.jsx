import { useState, useEffect, useCallback } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Shield,
  User,
  Ban,
} from "lucide-react";
import toast from "react-hot-toast";
import { adminApi } from "../../api/admin.api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const params = { page, limit: 10 };
    if (search) params.search = search;

    const res = await adminApi.getUsers(params);
    if (res.success) {
      const data = res.data;
      setUsers(data?.users ?? data ?? []);
      setTotalPages(data?.pagination?.totalPages ?? 1);
    } else {
      toast.error(res.message);
    }
    setLoading(false);
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleStatus = async (id) => {
    setTogglingId(id);
    const res = await adminApi.toggleUserStatus(id);
    if (res.success) {
      toast.success(res.message || "User status updated");
      fetchUsers();
    } else {
      toast.error(res.message);
    }
    setTogglingId(null);
  };

  const handleDelete = async (id) => {
    const res = await adminApi.deleteUser(id);
    if (res.success) {
      toast.success(res.message || "User deleted");
      setDeleteConfirm(null);
      fetchUsers();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-lux-text">Users</h1>
        <p className="text-sm text-lux-muted mt-0.5">Manage registered users</p>
      </div>

      <div className="relative max-w-xs">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lux-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search by name or email..."
          className="w-full bg-lux-card border border-lux-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-lux-text placeholder-text-muted focus:outline-none focus:border-gold-500 focus:ring-1 focus:ring-gold-500/30 transition-all"
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-lux-card animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16">
          <User className="mx-auto h-12 w-12 text-lux-muted/40 mb-4" />
          <p className="text-lux-muted">No users found</p>
        </div>
      ) : (
        <div className="bg-lux-card border border-lux-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-lux-border">
                  {["Name", "Email", "Role", "Status", "Joined", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-xs font-semibold text-lux-muted uppercase tracking-wider px-4 py-3 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className={`border-b border-lux-border/50 transition-colors ${
                      user.isDisabled
                        ? "bg-lux-bg/20 opacity-60"
                        : "hover:bg-lux-bg/30"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-lux-bg flex items-center justify-center text-xs font-bold text-lux-muted uppercase shrink-0">
                          {user.username?.charAt(0) || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-lux-text truncate max-w-[150px]">
                            {user.username || "N/A"}
                            {user.isDisabled && (
                              <span className="ml-2 text-[10px] text-lux-muted">(disabled)</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-lux-muted truncate max-w-[180px] block">
                        {user.email || "--"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {user.role === "admin" ? (
                          <>
                            <Shield size={13} className="text-gold-400" />
                            <span className="text-xs font-medium text-gold-400 capitalize">{user.role}</span>
                          </>
                        ) : (
                          <span className="text-xs text-lux-muted capitalize">{user.role || "user"}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                          user.isDisabled
                            ? "text-lux-muted bg-surface-600"
                            : "text-success bg-success/10"
                        }`}
                      >
                        {user.isDisabled ? "Disabled" : "Active"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-lux-muted">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "--"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleStatus(user._id)}
                          disabled={togglingId === user._id}
                          className="p-1.5 text-lux-muted hover:text-gold-500 hover:bg-surface-600 rounded-lg transition-colors disabled:opacity-50"
                          title={user.isDisabled ? "Enable User" : "Disable User"}
                        >
                          {togglingId === user._id ? (
                            <span className="w-[15px] h-[15px] block border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
                          ) : user.isDisabled ? (
                            <ToggleRight size={15} />
                          ) : (
                            <ToggleLeft size={15} />
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(user._id)}
                          className="p-1.5 text-lux-muted hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
                          title="Delete User"
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

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-lux-border">
              <span className="text-sm text-lux-muted">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg text-lux-muted hover:text-lux-text hover:bg-lux-bg disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-1.5 rounded-lg text-lux-muted hover:text-lux-text hover:bg-lux-bg disabled:opacity-30 transition-colors"
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
          <div className="relative bg-lux-card border border-lux-border rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-lux-text">Delete User</h3>
            <p className="text-sm text-lux-muted mt-2">
              Are you sure you want to delete this user? All their data will be permanently removed.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 rounded-xl bg-lux-bg text-lux-muted hover:text-lux-text transition-colors text-sm font-medium"
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
    </div>
  );
}

