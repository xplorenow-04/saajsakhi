import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
      if (categoriesRef.current && !categoriesRef.current.contains(e.target)) {
        setCategoriesOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (suggestTimer.current) clearTimeout(suggestTimer.current);
    if (searchQuery.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    suggestTimer.current = setTimeout(async () => {
      const res = await productApi.getSuggestions(searchQuery.trim());
      if (res.success) {
        setSuggestions(res.data || []);
        setShowSuggestions(true);
      }
    }, 250);
    return () => { if (suggestTimer.current) clearTimeout(suggestTimer.current); };
  }, [searchQuery]);

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  useEffect(() => {
    productApi.getCategories().then((res) => {
      if (res.success) setCategories(res.data || []);
    });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/shop?search=${encodeURIComponent(trimmed)}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

  const closeAll = () => {
    setMobileMenuOpen(false);
    setCategoriesOpen(false);
    setProfileOpen(false);
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${scrolled
        ? "bg-obsidian-950/85 backdrop-blur-xl border-obsidian-700/60 shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]"
        : "bg-obsidian-950/50 backdrop-blur-md border-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link
            to="/"
            onClick={closeAll}
            className="flex-shrink-0 group flex items-center gap-3"
          >
            <img
              src="/logo_emblem.png"
              alt="SaajSakhee Logo"
              className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-full border border-gold-500/20 shadow-md group-hover:scale-105 transition-all duration-300"
            />
            <span className="text-lg sm:text-xl lg:text-2xl font-bold tracking-[0.2em] font-luxury text-gradient-gold group-hover:opacity-90 transition-all">
              SAAJSAKHEE
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-sm font-medium text-text-secondary hover:text-accent transition-colors tracking-wide"
              >
                {link.name}
              </Link>
            ))}

            {/* Categories Dropdown */}
            <div className="relative" ref={categoriesRef}>
              <button
                onClick={() => setCategoriesOpen((prev) => !prev)}
                className="flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-accent transition-colors tracking-wide"
              >
                Categories
                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${categoriesOpen ? "rotate-180" : ""
                    }`}
                />
              </button>
              {categoriesOpen && (
                <div className="absolute top-full mt-2 -left-4 w-52 bg-surface-800 border border-surface-600 rounded-xl shadow-2xl shadow-black/30 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  {categories.map((cat) => (
                    <Link
                      key={cat.slug}
                      to={`/shop?category=${cat.slug}`}
                      onClick={closeAll}
                      className="block px-5 py-2.5 text-sm text-text-secondary hover:text-accent hover:bg-surface-700/50 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex items-center flex-1 max-w-md mx-8"
            ref={searchRef}
          >
            <div className="relative w-full">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                placeholder="Search products..."
                className="w-full bg-surface-800 border border-surface-600 rounded-full pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-800 border border-surface-600 rounded-xl shadow-2xl overflow-hidden z-50">
                  {suggestions.map((p) => (
                    <Link
                      key={p._id}
                      to={`/shop/${p.slug}`}
                      onClick={() => { setSearchQuery(""); setShowSuggestions(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-700 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface-700 overflow-hidden shrink-0">
                        {p.image ? (
                          <img src={p.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Search size={12} className="text-text-muted" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-text-primary truncate">{p.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* Icons */}
          <div className="flex items-center gap-3 lg:gap-4">
            <button
              onClick={() => navigate("/wishlist")}
              className="relative p-2 text-text-secondary hover:text-accent transition-colors rounded-lg hover:bg-surface-700/50"
            >
              <Heart size={20} />
            </button>

            {
              user?.role !== "admin" && <button
                onClick={() => navigate("/cart")}
                className="relative p-2 text-text-secondary hover:text-accent transition-colors rounded-lg hover:bg-surface-700/50"
              >
                <ShoppingBag size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-danger text-white text-[10px] font-bold leading-none min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </button>
            }

            {/* Profile Dropdown */}
            <div className="relative hidden lg:block" ref={profileRef}>
              {user ? (
                <>
                  <button
                    onClick={() => setProfileOpen((prev) => !prev)}
                    className="p-2 text-text-secondary hover:text-accent transition-colors rounded-lg hover:bg-surface-700/50"
                  >
                    <User size={20} />
                  </button>
                  {profileOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-surface-800 border border-surface-600 rounded-xl shadow-2xl shadow-black/30 py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-5 py-3 border-b border-surface-600">
                        <p className="text-sm font-medium text-text-primary">
                          {user.name || "My Account"}
                        </p>
                        <p className="text-xs text-text-muted mt-0.5">
                          {user.email}
                        </p>
                      </div>
                      {/* Admin Dashboard - only for admins */}
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={closeAll}
                          className="flex items-center gap-3 px-5 py-2.5 text-sm text-accent hover:text-white hover:bg-accent/20 transition-colors"
                        >
                          <Shield size={16} />
                          Admin Dashboard
                        </Link>
                      )}
                      <Link
                        to="/orders"
                        onClick={closeAll}
                        className="flex items-center gap-3 px-5 py-2.5 text-sm text-text-secondary hover:text-accent hover:bg-surface-700/50 transition-colors"
                      >
                        <Package size={16} />
                        Orders
                      </Link>
                      <Link
                        to="/profile"
                        onClick={closeAll}
                        className="flex items-center gap-3 px-5 py-2.5 text-sm text-text-secondary hover:text-accent hover:bg-surface-700/50 transition-colors"
                      >
                        <Settings size={16} />
                        Profile Settings
                      </Link>
                      <div className="border-t border-surface-600 mt-1 pt-1">
                        <button
                          onClick={() => { logout(); closeAll(); }}
                          className="flex items-center gap-3 w-full px-5 py-2.5 text-sm text-text-secondary hover:text-danger hover:bg-surface-700/50 transition-colors"
                        >
                          <LogOut size={16} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-neutral-950 bg-gradient-to-r from-gold-200 to-gold-500 hover:from-gold-300 hover:to-gold-600 rounded-lg transition-all shadow-[0_4px_15px_-3px_rgba(212,175,55,0.3)] hover:shadow-[0_4px_20px_-1px_rgba(212,175,55,0.45)] active:scale-[0.98]"
                >
                  <LogIn size={16} />
                  Sign In
                </Link>
              )}
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 text-text-secondary hover:text-accent transition-colors rounded-lg hover:bg-surface-700/50"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 overflow-hidden ${mobileMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="bg-surface-800/95 backdrop-blur-xl border-t border-surface-600 px-4 py-4 space-y-4">
          {/* Mobile Search */}
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                placeholder="Search products..."
                className="w-full bg-surface-700 border border-surface-600 rounded-full pl-10 pr-4 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-800 border border-surface-600 rounded-xl shadow-2xl overflow-hidden z-50">
                  {suggestions.map((p) => (
                    <Link
                      key={p._id}
                      to={`/shop/${p.slug}`}
                      onClick={() => { setSearchQuery(""); setShowSuggestions(false); setMobileMenuOpen(false); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-surface-700 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface-700 overflow-hidden shrink-0">
                        {p.image ? (
                          <img src={p.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Search size={12} className="text-text-muted" />
                          </div>
                        )}
                      </div>
                      <span className="text-sm text-text-primary truncate">{p.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* Mobile Nav Links */}
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeAll}
                className="block px-3 py-2.5 text-sm font-medium text-text-secondary hover:text-accent hover:bg-surface-700/50 rounded-lg transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-1">
              <p className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider">
                Categories
              </p>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/shop?category=${cat.slug}`}
                  onClick={closeAll}
                  className="block px-3 py-2.5 text-sm text-text-secondary hover:text-accent hover:bg-surface-700/50 rounded-lg transition-colors"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Profile */}
          <div className="border-t border-surface-600 pt-3">
            {user ? (
              <>
                <p className="px-3 py-1.5 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  {user.name || "My Account"}
                </p>
                {/* Admin link in mobile menu */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={closeAll}
                    className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-accent hover:bg-accent/10 rounded-lg transition-colors"
                  >
                    <Shield size={16} />
                    Admin Dashboard
                  </Link>
                )}
                <Link
                  to="/orders"
                  onClick={closeAll}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-text-secondary hover:text-accent hover:bg-surface-700/50 rounded-lg transition-colors"
                >
                  <Package size={16} />
                  Orders
                </Link>
                <Link
                  to="/profile"
                  onClick={closeAll}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-text-secondary hover:text-accent hover:bg-surface-700/50 rounded-lg transition-colors"
                >
                  <Settings size={16} />
                  Profile Settings
                </Link>
                <button
                  onClick={() => { logout(); closeAll(); }}
                  className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-text-secondary hover:text-danger hover:bg-surface-700/50 rounded-lg transition-colors"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="space-y-1">
                <Link
                  to="/login"
                  onClick={closeAll}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-accent hover:bg-surface-700/50 rounded-lg transition-colors"
                >
                  <LogIn size={16} />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeAll}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-text-secondary hover:text-accent hover:bg-surface-700/50 rounded-lg transition-colors"
                >
                  <UserPlus size={16} />
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
