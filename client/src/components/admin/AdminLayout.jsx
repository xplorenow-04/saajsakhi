import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu, Shield } from "lucide-react";
import AdminSidebar from "./AdminSidebar";
import { userAuthStore } from "../../store/userStore";

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = userAuthStore((s) => s.user);

  return (
    <div className="flex h-screen bg-lux-bg text-lux-text">
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="h-16 border-b border-lux-border bg-white flex items-center justify-between px-4 lg:px-6 shrink-0 shadow-warm-sm">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-lux-muted hover:text-lux-accent hover:bg-lux-bg rounded-lg transition-colors"
          >
            <Menu size={22} />
          </button>

          <div className="hidden lg:block" />

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-lux-bg rounded-xl border border-lux-border">
              <Shield size={15} className="text-lux-accent" />
              <span className="text-sm text-lux-muted font-medium">{user?.username || "Admin"}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-lux-accent/10 border border-lux-accent/20 flex items-center justify-center text-sm font-bold text-lux-accent uppercase font-display">
              {user?.username?.charAt(0) || "A"}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-lux-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
