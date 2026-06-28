import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoSearch, IoHeartOutline, IoBagOutline, IoPersonOutline, IoMenu, IoClose, IoMoon, IoSunny, IoLogOut } from 'react-icons/io5';
import { useShopStore } from '../../store/shopStore';
import { userAuthStore } from '../../store/userStore';
import { useTheme } from '../../context/ThemeContext';
import { userApi } from '../../api/user.api';
import toast from 'react-hot-toast';
import CartDrawer from '../cart/CartDrawer';

const navLinks = [
  { name: 'Men', path: '/shop?category=Men' },
  { name: 'Women', path: '/shop?category=Women' },
  { name: 'New Arrivals', path: '/shop?sort=newest' },
  { name: 'Sale', path: '/shop?discount=true' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const getCartCount = useShopStore(s => s.getCartCount);
  const { user, logout } = userAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const profileRef = useRef();

  const cartCount = getCartCount();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await userApi.logoutUser();
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
          scrolled
            ? 'glass shadow-md py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="text-2xl font-display italic font-bold">
                SAAJ<span className="accent-gradient-text">SAKHI</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(link => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-sm font-medium text-secondary hover:text-primary transition-colors relative group"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 accent-gradient rounded-full group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </div>

            {/* Icons */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSearchOpen(true)}
                className="p-2.5 rounded-full hover:bg-surface2 transition-all"
                aria-label="Search"
              >
                <IoSearch size={20} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTheme}
                className="p-2.5 rounded-full hover:bg-surface2 transition-all"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <IoSunny size={20} /> : <IoMoon size={20} />}
              </motion.button>

              <Link to="/wishlist">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2.5 rounded-full hover:bg-surface2 transition-all"
                  aria-label="Wishlist"
                >
                  <IoHeartOutline size={20} />
                </motion.button>
              </Link>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCartOpen(true)}
                className="p-2.5 rounded-full hover:bg-surface2 transition-all relative"
                aria-label="Cart"
              >
                <IoBagOutline size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full accent-gradient text-white text-[10px] font-bold flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </motion.button>

              <div className="relative" ref={profileRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowProfile(!showProfile)}
                  className="p-2.5 rounded-full hover:bg-surface2 transition-all"
                  aria-label="Profile"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <IoPersonOutline size={20} />
                  )}
                </motion.button>
                <AnimatePresence>
                  {showProfile && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-56 glass rounded-2xl shadow-xl p-2 border border-border"
                    >
                      <div className="px-3 py-2 border-b border-border mb-1">
                        <p className="text-sm font-medium truncate">{user?.name}</p>
                        <p className="text-xs text-muted truncate">{user?.email}</p>
                      </div>
                      <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface2 text-sm transition-all">
                        <IoPersonOutline size={16} />
                        My Profile
                      </Link>
                      <Link to="/profile/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface2 text-sm transition-all">
                        <IoBagOutline size={16} />
                        My Orders
                      </Link>
                      {user?.role === 'admin' && (
                        <Link to="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface2 text-sm transition-all">
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-danger/10 text-danger text-sm w-full transition-all mt-1 border-t border-border pt-3"
                      >
                        <IoLogOut size={16} />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2.5 rounded-full hover:bg-surface2 transition-all"
                aria-label="Menu"
              >
                {mobileOpen ? <IoClose size={22} /> : <IoMenu size={22} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass border-t border-border mt-3 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map(link => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-surface2 transition-all"
                  >
                    {link.name}
                  </Link>
                ))}
                <hr className="border-border my-2" />
                <Link to="/shop" className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-surface2 transition-all">
                  All Products
                </Link>
                <Link to="/wishlist" className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-surface2 transition-all">
                  Wishlist
                </Link>
                {user?.role === 'admin' && (
                  <Link to="/admin/dashboard" className="block px-4 py-3 rounded-xl text-sm font-medium hover:bg-surface2 transition-all">
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <SearchModal onClose={() => setSearchOpen(false)} navigate={navigate} />
        )}
      </AnimatePresence>

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

function SearchModal({ onClose, navigate }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [recent] = useState(() => JSON.parse(localStorage.getItem('recentSearches') || '[]'));
  const inputRef = useRef(null);

  const allCategories = ['Men', 'Women', 'Oversized', 'Streetwear', 'Accessories', 'Shoes'];

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.length > 1) {
      const filtered = allCategories.filter(c =>
        c.toLowerCase().includes(query.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearch = (term) => {
    const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    const updated = [term, ...searches.filter(s => s !== term)].slice(0, 5);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
    navigate(`/shop?search=${encodeURIComponent(term)}`);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="max-w-2xl mx-auto mt-20 px-4"
      >
        <div className="glass rounded-2xl p-6 shadow-xl">
          <div className="relative">
            <IoSearch size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && query.trim() && handleSearch(query.trim())}
              placeholder="Search products..."
              className="w-full bg-surface2 border border-border rounded-xl pl-12 pr-12 py-3.5 text-primary placeholder:text-muted focus:outline-none focus:border-accent transition-all"
            />
            <button
              onClick={onClose}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-surface3 transition-all"
            >
              <IoClose size={18} />
            </button>
          </div>

          {suggestions.length > 0 && (
            <div className="mt-4 space-y-1">
              <p className="text-xs text-muted uppercase tracking-wider px-2 mb-2">Suggestions</p>
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => handleSearch(s)}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-surface2 text-sm transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {!query && recent.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-muted uppercase tracking-wider px-2 mb-2">Recent Searches</p>
              <div className="flex flex-wrap gap-2">
                {recent.map(s => (
                  <button
                    key={s}
                    onClick={() => handleSearch(s)}
                    className="px-3 py-1.5 rounded-full bg-surface2 text-sm text-secondary hover:bg-surface3 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!query && recent.length === 0 && (
            <div className="mt-8 text-center text-muted">
              <IoSearch size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Search for products, categories...</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
