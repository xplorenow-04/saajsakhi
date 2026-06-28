import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { userAuthStore } from "../../store/userStore.js";
import { useShopStore } from "../../store/shopStore.js";
import { FiShoppingBag, FiUser, FiLogOut, FiGrid, FiGrid as FiList } from "react-icons/fi";
import { BiSearch } from "react-icons/bi";

function Navbar() {
    const { user, logout } = userAuthStore();
    const { getCartCount, fetchCart, setFilters, fetchProducts, filters } = useShopStore();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [searchVal, setSearchVal] = useState(filters.search || "");
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (user) {
            fetchCart();
        }
    }, [user]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setFilters({ search: searchVal, page: 1 });
        fetchProducts();
        if (location.pathname !== "/shop") {
            navigate("/shop");
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const cartCount = getCartCount();

    return (
        <nav className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 text-white transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-2xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-400 hover:opacity-90 transition-opacity">
                            SAAJ SAKHI
                        </Link>
                    </div>

                    {/* Desktop Search */}
                    <div className="hidden md:flex flex-1 max-w-md mx-8">
                        <form onSubmit={handleSearchSubmit} className="relative w-full">
                            <input
                                type="text"
                                placeholder="Search elegant sarees, lehengas, kurtis..."
                                value={searchVal}
                                onChange={(e) => setSearchVal(e.target.value)}
                                className="w-full bg-gray-900/60 border border-gray-800 rounded-full px-5 py-2.5 pl-12 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all duration-300 text-gray-200 placeholder-gray-500"
                            />
                            <BiSearch className="absolute left-4 top-3 text-gray-500 text-lg" />
                        </form>
                    </div>

                    {/* Actions / Navigation */}
                    <div className="flex items-center space-x-6">
                        <Link to="/shop" className="text-sm font-medium hover:text-amber-400 transition-colors duration-200">
                            Shop
                        </Link>

                        {/* Cart */}
                        <Link to="/cart" className="relative p-2 text-gray-300 hover:text-amber-400 transition-colors duration-200">
                            <FiShoppingBag className="text-2xl" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                    {cartCount}
                                </span>
                            )}
                        </Link>

                        {/* User Options */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center space-x-2 focus:outline-none group"
                                >
                                    <div className="w-8 h-8 rounded-full border border-gray-700 bg-gray-800 overflow-hidden transition duration-300 group-hover:border-amber-400">
                                        <img
                                            src={user.avatar || user.avtar || "https://static.vecteezy.com/system/resources/previews/024/983/914/non_2x/simple-user-default-icon-free-png.png"}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <span className="hidden sm:block text-sm font-medium group-hover:text-amber-400 transition-colors">
                                        {user.name}
                                    </span>
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-gray-900 border border-gray-800 shadow-2xl py-2 z-50 transform origin-top-right transition-all duration-300">
                                        <div className="px-4 py-2 border-b border-gray-800">
                                            <p className="text-xs text-gray-500">Logged in as</p>
                                            <p className="text-sm font-semibold truncate text-gray-200">{user.email}</p>
                                            {user.role === "admin" && (
                                                <span className="inline-block mt-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded-full">
                                                    Administrator
                                                </span>
                                            )}
                                        </div>

                                        <Link
                                            to="/profile/orders"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                                        >
                                            <FiList className="mr-3" /> My Orders
                                        </Link>

                                        {user.role === "admin" && (
                                            <Link
                                                to="/admin/dashboard"
                                                onClick={() => setDropdownOpen(false)}
                                                className="flex items-center px-4 py-2.5 text-sm text-amber-400 hover:bg-gray-800 hover:text-white transition-colors font-semibold"
                                            >
                                                <FiGrid className="mr-3" /> Admin Dashboard
                                            </Link>
                                        )}

                                        <button
                                            onClick={() => {
                                                setDropdownOpen(false);
                                                handleLogout();
                                            }}
                                            className="w-full flex items-center px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 transition-colors border-t border-gray-800 mt-1"
                                        >
                                            <FiLogOut className="mr-3" /> Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to="/login"
                                className="bg-gradient-to-r from-amber-500 to-rose-500 text-white font-medium text-sm px-5 py-2 rounded-full hover:from-amber-600 hover:to-rose-600 transition-all duration-300 shadow-md"
                            >
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
