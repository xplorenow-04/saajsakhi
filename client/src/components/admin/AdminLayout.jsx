import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Shield } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { userAuthStore } from "../../store/userStore";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = userAuthStore((s) => s.user);

  return (
    <div className="flex h-screen bg-surface-900 text-text-primary">
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-surface-600 bg-surface-800/80 backdrop-blur-md flex items-center justify-between px-4 lg:px-6 shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-text-secondary hover:text-text-primary hover:bg-surface-700/50 rounded-lg transition-colors"
          >
            <Menu size={22} />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-surface-700/50 rounded-lg">
              <Shield size={16} className="text-accent" />
              <span className="text-sm text-text-secondary">
                {user?.username || "Admin"}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent-light uppercase">
              {user?.username?.charAt(0) || "A"}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
