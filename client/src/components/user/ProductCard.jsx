import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useShopStore } from "../../store/shopStore.js";
import { FiShoppingCart, FiEye } from "react-icons/fi";
import Swal from "sweetalert2";

function ProductCard({ product }) {
    const { addToCart, fetchCart } = useShopStore();
    const [hovered, setHovered] = useState(false);
    const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
    const [adding, setAdding] = useState(false);

    const discountPrice = product.discount > 0 ? product.price - product.discount : null;

    const handleQuickAdd = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (product.stock <= 0) {
            Swal.fire({
                title: "Out of Stock",
                text: "This product is currently unavailable.",
                icon: "warning",
                confirmButtonColor: "#f59e0b"
            });
            return;
        }

        if (!selectedSize) {
            Swal.fire({
                title: "Select Size",
                text: "Please select a size to add this product to your cart.",
                icon: "info",
                confirmButtonColor: "#f59e0b"
            });
            return;
        }

        setAdding(true);
        const res = await addToCart(product._id, 1, selectedSize);
        setAdding(false);

        if (res.success) {
            Swal.fire({
                title: "Added to Cart",
                text: `${product.name} has been added to your cart.`,
                icon: "success",
                timer: 1500,
                showConfirmButton: false
            });
            fetchCart();
        } else {
            Swal.fire({
                title: "Failed to Add",
                text: res.message || "Something went wrong.",
                icon: "error",
                confirmButtonColor: "#ef4444"
            });
        }
    };

    const displayImage = product.images?.[0] || "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80";
    const hoverImage = product.images?.[1] || displayImage;

    return (
        <div 
            className="group relative bg-gray-900 border border-gray-800 rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:border-gray-700 hover:shadow-2xl hover:shadow-amber-500/5 flex flex-col h-full"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Image Section */}
            <div className="relative aspect-[3/4] overflow-hidden bg-gray-950">
                <img
                    src={hovered ? hoverImage : displayImage}
                    alt={product.name}
                    className="w-full h-full object-cover transition-all duration-700 ease-in-out group-hover:scale-110"
                />

                {/* Discount Badge */}
                {product.discount > 0 && (
                    <span className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-lg">
                        -{Math.round((product.discount / product.price) * 100)}% OFF
                    </span>
                )}

                {/* Out of stock Badge */}
                {product.stock <= 0 && (
                    <span className="absolute inset-0 bg-black/60 flex items-center justify-center text-sm font-semibold tracking-wider text-red-400 backdrop-blur-[2px]">
                        OUT OF STOCK
                    </span>
                )}

                {/* Hover Quick Action Panel */}
                {product.stock > 0 && (
                    <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex flex-col space-y-3">
                        {/* Size Selection */}
                        <div className="flex items-center justify-center space-x-2">
                            {product.sizes?.map((size) => (
                                <button
                                    key={size}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setSelectedSize(size);
                                    }}
                                    className={`w-8 h-8 rounded-full text-xs font-bold transition-all ${
                                        selectedSize === size
                                            ? "bg-amber-400 text-gray-900 shadow-md shadow-amber-400/20"
                                            : "bg-gray-800/80 text-white hover:bg-gray-700"
                                    }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={handleQuickAdd}
                            disabled={adding}
                            className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-lg shadow-rose-500/10 active:scale-95 disabled:opacity-50"
                        >
                            <FiShoppingCart />
                            <span>{adding ? "Adding..." : "QUICK ADD"}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Info Section */}
            <div className="p-5 flex flex-col flex-grow">
                <span className="text-xs font-bold text-amber-500 tracking-widest uppercase mb-1.5">
                    {product.category}
                </span>
                <Link to={`/product/${product._id}`} className="group-hover:text-amber-400 transition-colors">
                    <h3 className="text-sm font-bold text-gray-200 line-clamp-1 mb-2">
                        {product.name}
                    </h3>
                </Link>

                {/* Pricing info */}
                <div className="flex items-baseline space-x-2.5 mt-auto">
                    {discountPrice ? (
                        <>
                            <span className="text-base font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-rose-400">
                                ₹{discountPrice.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-500 line-through">
                                ₹{product.price.toLocaleString()}
                            </span>
                        </>
                    ) : (
                        <span className="text-base font-extrabold text-gray-200">
                            ₹{product.price.toLocaleString()}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ProductCard;
