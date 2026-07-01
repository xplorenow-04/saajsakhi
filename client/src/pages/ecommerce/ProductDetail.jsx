import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  ShoppingBag,
  Heart,
  Share2,
  ChevronDown,
  ChevronUp,
  Ruler,
  Check,
  AlertTriangle,
  Package,
  Truck,
  ShieldCheck,
  RefreshCw,
  X
} from "lucide-react";
import toast from "react-hot-toast";
import { productApi } from "../../api/product.api";
import { useEcommerceStore } from "../../store/useEcommerceStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { userAuthStore } from "../../store/userStore";
import Navbar from "../../components/ecommerce/Navbar";
import Footer from "../../components/ecommerce/Footer";
import LoadingSkeleton from "../../components/ecommerce/LoadingSkeleton";
import QuantitySelector from "../../components/ecommerce/QuantitySelector";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='750' fill='%23333'%3E%3Crect width='600' height='750'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666' font-size='20'%3ENo Image%3C/text%3E%3C/svg%3E";

const accordionItems = [
  {
    id: "description",
    title: "Description",
  },
  {
    id: "care",
    title: "Care Instructions",
  },
  {
    id: "shipping",
    title: "Shipping Info",
  },
];

export default function ProductDetail() {
  const navigate = useNavigate();
  const user = userAuthStore((s) => s.user);
  const { slug } = useParams();
  const { addToCart } = useEcommerceStore();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore();

  const [product, setProduct] = useState(null);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);

  useEffect(() => {
    if (!slug) return;
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await productApi.getProduct(slug);
        if (res.success && res.data) {
          setProduct(res.data);
          const sizes = res.data.sizes || [];
          if (sizes.length > 0) {
            const firstAvailable = sizes.find(
              (s) => (s.quantity ?? s.stock ?? 1) > 0
            );
            setSelectedSize(
              firstAvailable?.size || firstAvailable || sizes[0]?.size || sizes[0]
            );
          }
        } else {
          setError(res.message || "Product not found");
        }
      } catch (err) {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    setAddingToCart(true);
    try {
      const res = await addToCart(product._id, selectedSize, quantity);
      if (res.success) {
        toast.success("Added to cart!");
      } else {
        toast.error(res.message || "Failed to add to cart");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) {
      toast.error("Please login to manage wishlist");
      navigate("/login");
      return;
    }
    try {
      if (isInWishlist(product._id)) {
        await removeFromWishlist(product._id);
        toast.success("Removed from wishlist");
      } else {
        await addToWishlist(product._id);
        toast.success("Added to wishlist");
      }
    } catch (error) {
      toast.error("Failed to update wishlist");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-900">
        <Navbar />
        <main className="pt-20 lg:pt-16 pb-12 lg:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <LoadingSkeleton type="detail" count={1} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-surface-900">
        <Navbar />
        <main className="pt-20 lg:pt-16 pb-12 lg:pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-20 h-20 rounded-full bg-surface-800 border border-surface-700/50 flex items-center justify-center mb-5">
                <AlertTriangle size={36} className="text-warning" />
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                Product Not Found
              </h2>
              <p className="text-text-muted text-sm mb-6">{error}</p>
              <Link
                to="/shop"
                className="bg-accent hover:bg-accent/90 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) return null;

  const images = product.images?.length
    ? product.images.map((img) => img?.url || img)
    : [fallbackImage];
  const discount = product.discount || 0;
  const discountedPrice =
    discount > 0
      ? product.price - (product.price * discount) / 100
      : product.price;
  const sizes = product.sizes || [];
  const totalStock = sizes.reduce(
    (sum, s) => sum + (s.quantity ?? s.stock ?? 0),
    0
  );
  const inStock = totalStock > 0;

  const handleOrderViaWhatsApp = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    const formattedPrice = formatPrice(discountedPrice);
    const productLink = window.location.href;
    const message = `Hello Saajsakhee, I would like to order this item:
*Product*: ${product.name}
*Size*: ${selectedSize}
*Price*: ${formattedPrice}
*Quantity*: ${quantity}
*Product Link*: ${productLink}`;

    const whatsappUrl = `https://wa.me/919022565195?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-surface-900">
      <Navbar />

      <main className="pt-20 lg:pt-16 pb-12 lg:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
            <Link to="/ecommerce" className="hover:text-accent transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link
              to="/shop"
              className="hover:text-accent transition-colors"
            >
              Shop
            </Link>
            <span>/</span>
            <span className="text-text-secondary truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-[4/5] lg:max-h-[calc(100vh-14rem)] rounded-2xl overflow-hidden bg-surface-800 border border-surface-700/50 group">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover lg:object-contain transition-opacity duration-300"
                  onError={(e) => {
                    e.target.src = fallbackImage;
                  }}
                />
                {discount > 0 && (
                  <div className="absolute top-4 left-4 bg-danger text-white text-sm font-bold px-3 py-1.5 rounded-lg shadow-lg">
                    -{Math.round(discount)}%
                  </div>
                )}
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <button 
                    onClick={handleWishlistToggle}
                    className={`w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all ${
                      isInWishlist(product._id) 
                        ? "bg-gold-500/20 text-gold-400" 
                        : "bg-surface-900/70 text-text-muted hover:text-accent hover:bg-surface-900"
                    }`}
                  >
                    <Heart size={18} className={isInWishlist(product._id) ? "fill-gold-400" : ""} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-surface-900/70 backdrop-blur-sm flex items-center justify-center text-text-muted hover:text-accent hover:bg-surface-900 transition-all">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 transition-all ${selectedImage === idx
                          ? "border-accent ring-1 ring-accent/30"
                          : "border-surface-700/50 hover:border-surface-500"
                        }`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = fallbackImage;
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-5 lg:space-y-6">
              {/* Category */}
              {product.category && (
                <span className="inline-block text-xs font-bold text-gold-400 uppercase tracking-widest bg-gold-500/10 border border-gold-500/20 px-3.5 py-1.5 rounded-full">
                  {typeof product.category === "object"
                    ? product.category.name
                    : product.category}
                </span>
              )}

              {/* Name */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-accent">
                  {formatPrice(discountedPrice)}
                </span>
                {discount > 0 && (
                  <>
                    <span className="text-lg text-text-muted line-through">
                      {formatPrice(product.price)}
                    </span>
                    <span className="text-sm font-semibold text-success bg-success/10 px-2.5 py-0.5 rounded-full">
                      {Math.round(discount)}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Description */}
              <p className="text-text-secondary leading-relaxed text-sm">
                {product.description || "No description available."}
              </p>

              {/* Size Selection */}
              {sizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-text-primary">
                      Select Size
                    </h3>
                    <button onClick={() => setSizeGuideOpen(true)} className="flex items-center gap-1.5 text-xs text-accent hover:text-accent-light transition-colors">
                      <Ruler size={14} />
                      Size Guide
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {sizes.map((s) => {
                      const sizeVal = s?.size || s;
                      const stock = s.quantity ?? s.stock ?? 0;
                      const outOfStock = stock === 0;
                      const isSelected = selectedSize === sizeVal;
                      return (
                        <button
                          key={sizeVal}
                          onClick={() => {
                            if (!outOfStock) setSelectedSize(sizeVal);
                          }}
                          disabled={outOfStock}
                          className={`relative min-w-[52px] px-4 py-3 text-sm font-semibold rounded-xl border transition-all ${isSelected
                              ? "bg-gradient-to-r from-gold-200 to-gold-500 border-transparent text-neutral-950 shadow-[0_4px_12px_rgba(212,175,55,0.25)]"
                              : outOfStock
                                ? "bg-surface-800/40 border-surface-600/60 text-text-dim/20 line-through cursor-not-allowed"
                                : "bg-surface-950 border-surface-600 text-text-secondary hover:border-gold-500/40 hover:text-gold-400"
                            }`}
                        >
                          {sizeVal}
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold-500 rounded-full flex items-center justify-center">
                              <Check size={10} strokeWidth={3} className="text-neutral-950" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock Indicator */}
              <div className="flex items-center gap-2">
                {inStock ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="text-sm text-success">In Stock</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-danger" />
                    <span className="text-sm text-danger">Out of Stock</span>
                  </>
                )}
              </div>

              {/* Quantity + Add to Cart */}
              <div className="space-y-3">
                <div className="flex items-stretch gap-3">
                  <QuantitySelector
                    value={quantity}
                    onChange={setQuantity}
                    min={1}
                    max={10}
                  />
                  <button
                    onClick={handleAddToCart}
                    disabled={!inStock || addingToCart}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gold-200 via-gold-500 to-gold-600 text-neutral-950 font-bold py-3.5 rounded-xl transition-all duration-300 shadow-[0_4px_20px_rgba(212,175,55,0.35)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ShoppingBag size={18} />
                    {addingToCart ? "Adding..." : "Add to Cart"}
                  </button>
                </div>

                <button
                  onClick={handleOrderViaWhatsApp}
                  disabled={!inStock}
                  className="w-full flex items-center justify-center gap-2 border border-[#25D366]/40 hover:border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5 font-semibold py-3.5 rounded-xl transition-all duration-300 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.484 2.012 14.03 1.002 11.99 1.002c-5.447 0-9.873 4.372-9.877 9.802-.001 1.777.469 3.51 1.36 5.031L2.44 20.8l5.127-1.332.08-.047c.001-.001.001-.001.002-.002zm12.361-5.395c-.33-.165-1.951-.951-2.253-1.061-.301-.11-.52-.165-.74.165-.22.33-.852 1.061-1.044 1.281-.192.22-.384.247-.714.082-1.359-.68-2.335-1.18-3.148-2.58-.216-.374.216-.347.618-1.15.066-.138.033-.259-.017-.364-.05-.105-.44-1.06-.603-1.453-.159-.384-.334-.33-.46-.337-.118-.006-.253-.007-.388-.007-.136 0-.356.05-.542.253-.187.203-.712.697-.712 1.7 0 1.003.729 1.972.83 2.11.101.137 1.436 2.193 3.479 3.075.487.21 1.01.272 1.408.21.439-.065 1.348-.551 1.537-1.056.19-.505.19-.938.133-1.029-.056-.091-.207-.145-.537-.31z" />
                  </svg>
                  Order via WhatsApp
                </button>
              </div>


              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  { icon: Truck, text: "Free delivery" },
                  { icon: RefreshCw, text: "Easy returns" },
                  { icon: ShieldCheck, text: "Secure" },
                ].map((badge) => {
                  const BadgeIcon = badge.icon;
                  return (
                    <div
                      key={badge.text}
                      className="flex items-center gap-2 text-xs text-text-secondary bg-surface-950 border border-surface-600/40 rounded-lg px-3 py-2.5"
                    >
                      <BadgeIcon size={14} className="text-gold-400 shrink-0" />
                      <span>{badge.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Accordion Details */}
          <div className="mt-8 lg:mt-12 max-w-3xl">
            <div className="border-t border-surface-700/50">
              {accordionItems.map((item) => {
                const isOpen = openAccordion === item.id;
                return (
                  <div
                    key={item.id}
                    className="border-b border-surface-700/50"
                  >
                    <button
                      onClick={() =>
                        setOpenAccordion(isOpen ? null : item.id)
                      }
                      className="w-full flex items-center justify-between py-5 text-left hover:bg-surface-800/30 px-1 transition-colors rounded-lg"
                    >
                      <span className="text-sm font-semibold text-text-primary">
                        {item.title}
                      </span>
                      {isOpen ? (
                        <ChevronUp size={16} className="text-text-muted" />
                      ) : (
                        <ChevronDown size={16} className="text-text-muted" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="pb-5 px-1 animate-slide-down">
                        <p className="text-sm text-text-secondary leading-relaxed">
                          {item.id === "description"
                            ? (product.description ||
                              "No description available.")
                            : item.id === "care"
                              ? (product.careInstructions ||
                                "Dry clean recommended. Do not bleach. Iron on low heat. Store in a cool, dry place away from direct sunlight.")
                              : "Free shipping on orders above ₹999. Orders are processed within 1-2 business days. Standard delivery takes 3-7 business days. Express delivery available at checkout."}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSizeGuideOpen(false)} />
          <div className="relative bg-surface-800 border border-surface-600 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-600">
              <h2 className="text-lg font-bold text-gradient-gold">Size Guide</h2>
              <button onClick={() => setSizeGuideOpen(false)} className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-700 transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-text-primary mb-3">Women's Clothing</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-surface-600">
                        <th className="text-left text-xs font-semibold text-gold-400 uppercase tracking-wider px-3 py-2">Size</th>
                        <th className="text-left text-xs font-semibold text-gold-400 uppercase tracking-wider px-3 py-2">Bust (in)</th>
                        <th className="text-left text-xs font-semibold text-gold-400 uppercase tracking-wider px-3 py-2">Waist (in)</th>
                        <th className="text-left text-xs font-semibold text-gold-400 uppercase tracking-wider px-3 py-2">Hips (in)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { size: "XS", bust: "30-32", waist: "24-26", hips: "32-34" },
                        { size: "S", bust: "32-34", waist: "26-28", hips: "34-36" },
                        { size: "M", bust: "34-36", waist: "28-30", hips: "36-38" },
                        { size: "L", bust: "36-38", waist: "30-32", hips: "38-40" },
                        { size: "XL", bust: "38-41", waist: "32-35", hips: "40-43" },
                        { size: "XXL", bust: "41-44", waist: "35-38", hips: "43-46" },
                        { size: "3XL", bust: "44-47", waist: "38-41", hips: "46-49" },
                      ].map((row) => (
                        <tr key={row.size} className="border-b border-surface-700/50 hover:bg-surface-700/30">
                          <td className="px-3 py-2.5 text-text-primary font-medium">{row.size}</td>
                          <td className="px-3 py-2.5 text-text-secondary">{row.bust}</td>
                          <td className="px-3 py-2.5 text-text-secondary">{row.waist}</td>
                          <td className="px-3 py-2.5 text-text-secondary">{row.hips}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-surface-700/50 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider">How to Measure</h4>
                <ul className="text-xs text-text-secondary space-y-1.5">
                  <li><span className="text-text-primary font-medium">Bust:</span> Measure around the fullest part of your bust, keeping the tape horizontal.</li>
                  <li><span className="text-text-primary font-medium">Waist:</span> Measure around the narrowest part of your natural waist.</li>
                  <li><span className="text-text-primary font-medium">Hips:</span> Measure around the fullest part of your hips, keeping the tape horizontal.</li>
                </ul>
                <p className="text-xs text-text-muted mt-2">If your measurements fall between sizes, we recommend sizing up for a comfortable fit.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
