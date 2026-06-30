import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Heart, Eye, Tag } from "lucide-react";
import toast from "react-hot-toast";
import { useEcommerceStore } from "../../store/useEcommerceStore";
import { userAuthStore } from "../../store/userStore";

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='500' fill='%23F0E6DF'%3E%3Crect width='400' height='500'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23C9B8AB' font-size='16' font-family='serif'%3ENo Image%3C/text%3E%3C/svg%3E";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

export default function ProductCard({ product, loading = false }) {
  const navigate = useNavigate();
  const { addToCart } = useEcommerceStore();
  const user = userAuthStore((s) => s.user);
  const [selectedSize, setSelectedSize] = useState(null);
  const [adding, setAdding] = useState(false);
  const [wishlisted, setWishlisted] = useState(false);

  if (loading) {
    return (
      <div className="bg-lux-card rounded-2xl border border-lux-border overflow-hidden shadow-card animate-pulse">
        <div className="aspect-[4/5] bg-lux-warm shimmer" />
        <div className="p-4 space-y-3">
          <div className="h-3 bg-lux-border rounded-full w-1/3" />
          <div className="h-4 bg-lux-border rounded-full w-4/5" />
          <div className="h-4 bg-lux-border rounded-full w-3/5" />
          <div className="h-3 bg-lux-border rounded-full w-2/4" />
        </div>
      </div>
    );
  }

  const { _id, name, slug, price, discount = 0, images = [], sizes = [], category = "" } = product;
  const discountedPrice = discount > 0 ? price - (price * discount) / 100 : price;
  const displayImage = images?.[0]?.url || images?.[0] || fallbackImage;
  const displayCategory = typeof category === "object" ? category?.name : category;
  const defaultSize = selectedSize || sizes?.[0]?.size || sizes?.[0] || null;

  const handleAddToCart = async (e) => {
    if (e) e.preventDefault();
    if (!user) { navigate("/login"); return; }
    if (!defaultSize) { toast.error("Please select a size"); return; }
    setAdding(true);
    try {
      await addToCart(_id, defaultSize, 1);
      toast.success("Added to bag!");
    } catch {
      toast.error("Failed to add to bag");
    } finally {
      setAdding(false);
    }
  };

  return (
    <Link
      to={`/shop/${slug || _id}`}
      className="group block bg-lux-card rounded-2xl overflow-hidden border border-lux-border shadow-card hover:shadow-card-hover hover:-translate-y-1.5 transition-all duration-400"
    >
      {/* Image */}
      <div className="relative aspect-[4/5] overflow-hidden bg-lux-bg">
        <img
          src={displayImage}
          alt={name || "Product"}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          style={{ "--tw-scale-x": "1.08", "--tw-scale-y": "1.08" }}
          onError={(e) => { e.target.src = fallbackImage; }}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {discount > 0 && (
            <span className="bg-lux-danger text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              -{Math.round(discount)}% OFF
            </span>
          )}
          {!discount && (
            <span className="bg-lux-text text-white text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-sm tracking-wider">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setWishlisted((w) => !w); }}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-warm-sm transition-all duration-200 hover:bg-white hover:scale-110 opacity-0 group-hover:opacity-100"
          aria-label="Wishlist"
        >
          <Heart
            size={14}
            className={wishlisted ? "text-lux-danger fill-lux-danger" : "text-lux-muted"}
          />
        </button>

        {/* Quick Actions Overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out p-3 flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={adding || !defaultSize}
            className="flex-1 flex items-center justify-center gap-1.5 bg-lux-text hover:bg-lux-accent text-white text-xs font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <ShoppingBag size={14} />
            {adding ? "Adding…" : "Add to Bag"}
          </button>
          <div className="bg-white/95 text-lux-muted hover:text-lux-accent p-3 rounded-xl transition-colors cursor-pointer shadow-lg">
            <Eye size={14} />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2.5">
        {displayCategory && (
          <p className="text-[10px] font-semibold text-lux-accent uppercase tracking-[0.12em]">{displayCategory}</p>
        )}

        <h3 className="text-sm font-medium text-lux-text leading-snug line-clamp-2 group-hover:text-lux-accent transition-colors duration-200">
          {name || "Unnamed Product"}
        </h3>

        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-base font-bold text-lux-text">
            {formatPrice(discountedPrice)}
          </span>
          {discount > 0 && (
            <span className="text-xs text-lux-dim line-through">{formatPrice(price)}</span>
          )}
        </div>

        {/* Size pills */}
        {sizes && sizes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {sizes.map((s) => {
              const sizeValue = s?.size || s;
              const isSelected = (selectedSize || sizes?.[0]?.size || sizes?.[0]) === sizeValue;
              const outOfStock = s?.quantity !== undefined && s.quantity === 0;
              return (
                <button
                  key={sizeValue}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (!outOfStock) setSelectedSize(sizeValue); }}
                  disabled={outOfStock}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-lg border transition-all ${
                    isSelected
                      ? "bg-lux-text border-lux-text text-white"
                      : outOfStock
                      ? "bg-lux-bg border-lux-border text-lux-dim line-through cursor-not-allowed"
                      : "bg-white border-lux-border text-lux-muted hover:border-lux-accent hover:text-lux-accent"
                  }`}
                >
                  {sizeValue}
                </button>
              );
            })}
          </div>
        )}

        {/* Mobile Add to Bag */}
        <button
          onClick={handleAddToCart}
          disabled={adding || !defaultSize}
          className="lg:hidden w-full flex items-center justify-center gap-2 bg-lux-text hover:bg-lux-accent text-white text-xs font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-1"
        >
          <ShoppingBag size={13} />
          {adding ? "Adding…" : "Add to Bag"}
        </button>
      </div>
    </Link>
  );
}
