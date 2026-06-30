import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  Store, LogOut, X, Tags, ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { userApi } from "../../api/user.api";
import { userAuthStore } from "../../store/userStore";

const navItems = [
  { name: "Dashboard",  path: "/admin",            icon: LayoutDashboard },
  { name: "Products",   path: "/admin/products",   icon: Package },
  { name: "Categories", path: "/admin/categories", icon: Tags },
  { name: "Orders",     path: "/admin/orders",     icon: ShoppingCart },
  { name: "Users",      path: "/admin/users",      icon: Users },
];

export default function AdminSidebar({ mobileOpen, setMobileOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const res = await userApi.logoutUser();
    if (res.success) userAuthStore.getState().logout();
    toast.success("Logged out");
    navigate("/login");
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 h-16 border-b border-lux-border bg-white">
        <Link to="/admin" className="flex flex-col leading-none">
          <span className="text-lg font-display font-bold tracking-[0.12em] text-lux-text">SAAJSAKHEE</span>
          <span className="text-[9px] tracking-[0.3em] uppercase text-lux-accent font-medium">Admin</span>
        </Link>
        <button onClick={() => setMobileOpen(false)} className="lg:hidden p-1.5 text-lux-muted hover:text-lux-text rounded-lg transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="px-3 pb-2 text-[10px] font-semibold text-lux-dim uppercase tracking-[0.2em]">Navigation</p>
        {navItems.map((item) => {
          const isActive = item.path === "/admin"
            ? location.pathname === "/admin"
            : location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                isActive
                  ? "bg-lux-accent text-white shadow-warm-sm"
                  : "text-lux-muted hover:text-lux-text hover:bg-lux-bg"
              }`}
            >
              <item.icon size={17} className={isActive ? "text-white" : "text-lux-dim group-hover:text-lux-accent"} />
              <span className="flex-1">{item.name}</span>
              {isActive && <ChevronRight size={13} className="text-white/60" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 border-t border-lux-border pt-4 space-y-1">
        <Link
          to="/"
          onClick={() => setMobileOpen(false)}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-lux-muted hover:text-lux-text hover:bg-lux-bg transition-all duration-200"
        >
          <Store size={17} className="text-lux-dim" />
          Back to Store
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium text-lux-muted hover:text-lux-danger hover:bg-red-50 transition-all duration-200"
        >
          <LogOut size={17} className="text-lux-dim" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-lux-bg2 border-r border-lux-border h-screen sticky top-0 shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-lux-text/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-lux-bg2 border-r border-lux-border shadow-warm-xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
