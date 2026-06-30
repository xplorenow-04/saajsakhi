import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  ChevronDown,
  Menu,
  X,
  LogOut,
  Package,
  Settings,
  LogIn,
  UserPlus,
  Shield,
} from "lucide-react";
import { useEcommerceStore } from "../../store/useEcommerceStore";
import { userAuthStore } from "../../store/userStore";
import { productApi } from "../../api/product.api";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/shop" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = userAuthStore((s) => s.user);
  const logout = userAuthStore((s) => s.logout);
  const { cartCount, fetchCart } = useEcommerceStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const categoriesRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);
  const suggestTimer = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) setCategoriesOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (searchQuery.trim().length < 1) { setSuggestions([]); setShowSuggestions(false); return; }
    suggestTimer.current = setTimeout(async () => {
      const res = await productApi.getSuggestions(searchQuery.trim());
      if (res.success) { setSuggestions(res.data || []); setShowSuggestions(true); }
    }, 250);
    return () => { if (suggestTimer.current) clearTimeout(suggestTimer.current); };
  }, [searchQuery]);

  useEffect(() => { if (user) fetchCart(); }, [user, fetchCart]);

  useEffect(() => {
    productApi.getCategories().then((res) => { if (res.success) setCategories(res.data || []); });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) { navigate(`/shop?search=${encodeURIComponent(trimmed)}`); setSearchQuery(""); setMobileMenuOpen(false); }
  };

  const closeAll = () => { setMobileMenuOpen(false); setCategoriesOpen(false); setProfileOpen(false); };

  const isActive = (path) => path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
      scrolled
        ? "bg-white/95 backdrop-blur-lg border-b border-lux-border shadow-nav"
        : "bg-lux-bg/90 backdrop-blur-md border-b border-transparent"
    }`}>
      {/* Announcement bar */}
      <div className="bg-lux-text text-white text-center py-2 text-[11px] font-medium tracking-[0.15em] uppercase">
        Free shipping on orders above ₹999 &nbsp;·&nbsp; Easy 30-day returns
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">

          {/* Logo */}
          <Link to="/" onClick={closeAll} className="flex-shrink-0 group">
            <div className="flex flex-col leading-none">
              <h1 className="text-xl lg:text-2xl font-display font-bold tracking-[0.15em] text-lux-text group-hover:text-lux-accent transition-colors duration-300">
                SAAJSAKHEE
              </h1>
              <span className="text-[9px] tracking-[0.35em] uppercase text-lux-muted font-medium">Women</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium tracking-wide transition-colors duration-200 relative group ${
                  isActive(link.path) ? "text-lux-accent" : "text-lux-muted hover:text-lux-text"
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 h-[1.5px] bg-lux-accent transition-all duration-300 ${
                  isActive(link.path) ? "w-full" : "w-0 group-hover:w-full"
                }`} />
              </Link>
            ))}

            {/* Categories Dropdown */}
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={() => setCategoriesOpen((prev) => !prev)}
                className="flex items-center gap-1.5 text-sm font-medium text-lux-muted hover:text-lux-text transition-colors tracking-wide"
              >
                Collections
                <ChevronDown size={14} className={`transition-transform duration-200 ${categoriesOpen ? "rotate-180" : ""}`} />
              </button>
              {categoriesOpen && (
                <div className="absolute top-full mt-3 -left-4 w-52 bg-white border border-lux-border rounded-2xl shadow-warm-lg py-2 animate-slide-down z-50">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/shop?category=${cat.slug}`}
                      onClick={closeAll}
                      className="block px-5 py-2.5 text-sm text-lux-muted hover:text-lux-accent hover:bg-lux-bg transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Search */}
          <form onSubmit={handleSearch} className="hidden lg:flex items-center flex-1 max-w-sm mx-8" ref={searchRef}>
            <div className="relative w-full">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-lux-dim" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                placeholder="Search styles..."
                className="w-full bg-lux-bg border border-lux-border rounded-full pl-10 pr-4 py-2.5 text-sm text-lux-text placeholder-lux-dim focus:outline-none focus:border-lux-accent focus:ring-2 focus:ring-lux-accent/15 transition-all"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-lux-border rounded-2xl shadow-warm-lg overflow-hidden z-50">
                  {suggestions.map((p) => (
                    <Link
                      key={p._id}
                      to={`/shop/${p.slug}`}
                      onClick={() => { setSearchQuery(""); setShowSuggestions(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-lux-bg transition-colors"
                    >
                      <div className="w-9 h-9 rounded-lg bg-lux-bg overflow-hidden shrink-0">
                        {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : <Search size={12} className="text-lux-dim m-auto mt-2.5" />}
                      </div>
                      <span className="text-sm text-lux-text truncate">{p.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* Icons */}
          <div className="flex items-center gap-1 lg:gap-2">
            <button
              onClick={() => navigate("/wishlist")}
              className="relative p-2.5 text-lux-muted hover:text-lux-accent transition-colors rounded-full hover:bg-lux-light"
              aria-label="Wishlist"
            >
              <Heart size={19} />
            </button>

            {user?.role !== "admin" && (
              <button
                onClick={() => navigate("/cart")}
                className="relative p-2.5 text-lux-muted hover:text-lux-accent transition-colors rounded-full hover:bg-lux-light"
                aria-label="Cart"
              >
                <ShoppingBag size={19} />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 bg-lux-accent text-white text-[9px] font-bold min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-0.5">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Profile */}
            <div className="relative hidden lg:block" ref={profileRef}>
              {user ? (
                <>
                  <button
                    onClick={() => setProfileOpen((prev) => !prev)}
                    className="flex items-center gap-2 pl-2 pr-3 py-2 text-lux-muted hover:text-lux-accent transition-colors rounded-full hover:bg-lux-light"
                  >
                    <div className="w-7 h-7 rounded-full bg-lux-accent/15 flex items-center justify-center text-xs font-bold text-lux-accent uppercase">
                      {user.username?.charAt(0) || "U"}
                    </div>
                    <ChevronDown size={13} className={`transition-transform duration-200 ${profileOpen ? "rotate-180" : ""}`} />
                  </button>
                  {profileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-60 bg-white border border-lux-border rounded-2xl shadow-warm-lg py-2 animate-slide-down z-50">
                      <div className="px-5 py-3 border-b border-lux-border">
                        <p className="text-sm font-semibold text-lux-text">{user.username || "My Account"}</p>
                        <p className="text-xs text-lux-muted mt-0.5">{user.email}</p>
                      </div>
                      {user.role === "admin" && (
                        <Link to="/admin" onClick={closeAll} className="flex items-center gap-3 px-5 py-2.5 text-sm text-lux-accent hover:bg-lux-bg transition-colors">
                          <Shield size={15} /> Admin Dashboard
                        </Link>
                      )}
                      <Link to="/orders" onClick={closeAll} className="flex items-center gap-3 px-5 py-2.5 text-sm text-lux-muted hover:text-lux-accent hover:bg-lux-bg transition-colors">
                        <Package size={15} /> My Orders
                      </Link>
                      <Link to="/profile" onClick={closeAll} className="flex items-center gap-3 px-5 py-2.5 text-sm text-lux-muted hover:text-lux-accent hover:bg-lux-bg transition-colors">
                        <Settings size={15} /> Profile Settings
                      </Link>
                      <div className="border-t border-lux-border mt-1 pt-1">
                        <button
                          onClick={() => { logout(); closeAll(); }}
                          className="flex items-center gap-3 w-full px-5 py-2.5 text-sm text-lux-muted hover:text-lux-danger hover:bg-lux-bg transition-colors"
                        >
                          <LogOut size={15} /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-lux-accent hover:bg-lux-hover rounded-full transition-all duration-300 shadow-warm-sm hover:shadow-warm-md active:scale-[0.98]"
                >
                  <LogIn size={15} /> Sign In
                </Link>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2.5 text-lux-muted hover:text-lux-text transition-colors rounded-full hover:bg-lux-light"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? "max-h-[700px] opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="bg-white border-t border-lux-border px-4 py-5 space-y-4">
          {/* Mobile Search */}
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-lux-dim" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search styles..."
                className="w-full bg-lux-bg border border-lux-border rounded-full pl-10 pr-4 py-2.5 text-sm text-lux-text placeholder-lux-dim focus:outline-none focus:border-lux-accent transition-all"
              />
            </div>
          </form>

          {/* Mobile Nav */}
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={closeAll}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive(link.path) ? "text-lux-accent bg-lux-bg" : "text-lux-muted hover:text-lux-text hover:bg-lux-bg"
                }`}>
                {link.name}
              </Link>
            ))}
            {categories.length > 0 && (
              <div>
                <p className="px-4 py-2 text-[10px] font-semibold text-lux-dim uppercase tracking-widest">Collections</p>
                {categories.map((cat) => (
                  <Link key={cat.slug} to={`/shop?category=${cat.slug}`} onClick={closeAll}
                    className="block px-4 py-2.5 rounded-xl text-sm text-lux-muted hover:text-lux-accent hover:bg-lux-bg transition-colors">
                    {cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Profile */}
          <div className="border-t border-lux-border pt-4">
            {user ? (
              <>
                <p className="px-4 pb-2 text-xs font-semibold text-lux-muted">{user.username || "My Account"}</p>
                {user.role === "admin" && (
                  <Link to="/admin" onClick={closeAll} className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-lux-accent hover:bg-lux-bg rounded-xl transition-colors">
                    <Shield size={15} /> Admin Dashboard
                  </Link>
                )}
                <Link to="/orders" onClick={closeAll} className="flex items-center gap-3 px-4 py-2.5 text-sm text-lux-muted hover:text-lux-accent hover:bg-lux-bg rounded-xl transition-colors">
                  <Package size={15} /> My Orders
                </Link>
                <Link to="/profile" onClick={closeAll} className="flex items-center gap-3 px-4 py-2.5 text-sm text-lux-muted hover:text-lux-accent hover:bg-lux-bg rounded-xl transition-colors">
                  <Settings size={15} /> Profile Settings
                </Link>
                <button onClick={() => { logout(); closeAll(); }} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-lux-muted hover:text-lux-danger hover:bg-lux-bg rounded-xl transition-colors">
                  <LogOut size={15} /> Sign Out
                </button>
              </>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={closeAll} className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-white bg-lux-accent hover:bg-lux-hover rounded-full transition-all">
                  <LogIn size={15} /> Sign In
                </Link>
                <Link to="/register" onClick={closeAll} className="flex items-center justify-center gap-2 w-full py-3 text-sm font-medium text-lux-accent border border-lux-accent hover:bg-lux-accent hover:text-white rounded-full transition-all">
                  <UserPlus size={15} /> Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
