import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Store,
  LogOut,
  ChevronLeft,
  X,
  Tags
} from "lucide-react";
import toast from "react-hot-toast";
import { userApi } from "../../api/user.api";
import { userAuthStore } from "../../store/userStore";

const navItems = [
  { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
  { name: "Products", path: "/admin/products", icon: Package },
  { name: "Categories", path: "/admin/categories", icon: Tags },
  { name: "Orders", path: "/admin/orders", icon: ShoppingCart },
  { name: "Users", path: "/admin/users", icon: Users },
];

export default function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const res = await userApi.logoutUser();
    if (res.success) {
      userAuthStore.getState().logout();
    }
    toast.success("Logged out");
    navigate("/login");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 h-16 border-b border-surface-600">
        <Link to="/admin" className="flex items-center gap-2.5 group">
          <img
            src="/logo_emblem.png"
            alt="SaajSakhee Logo"
            className="w-9 h-9 object-contain rounded-full border border-gold-500/20 shadow-md group-hover:scale-105 transition-all duration-300"
          />
          <span className="text-lg font-bold text-gradient-gold tracking-wider font-display group-hover:opacity-90 transition-all">
            ADMIN
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden p-1.5 text-text-muted hover:text-text-primary transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive =
            item.path === "/admin"
              ? location.pathname === "/admin"
              : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${isActive
                ? "bg-gold-500/10 border border-gold-500/20 text-gold-400 shadow-sm"
                : "text-text-secondary border border-transparent hover:text-text-primary hover:bg-surface-700/60"
                }`}
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4 border-t border-surface-600 pt-4 space-y-1">
        <Link
          to="/shop"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface-700/60 transition-all duration-200"
        >
          <Store size={18} />
          <span>Back to Store</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:text-danger hover:bg-danger/10 transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:flex flex-col w-60 bg-surface-800 border-r border-surface-600 h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-surface-800 border-r border-surface-600 shadow-2xl animate-slide-right">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
