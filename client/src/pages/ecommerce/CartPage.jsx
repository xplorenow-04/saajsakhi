import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingBag,
  Trash2,
  ArrowLeft,
  Minus,
  Plus,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import { useEcommerceStore } from "../../store/useEcommerceStore";
import Navbar from "../../components/ecommerce/Navbar";
import Footer from "../../components/ecommerce/Footer";
import LoadingSkeleton from "../../components/ecommerce/LoadingSkeleton";
import EmptyState from "../../components/ecommerce/EmptyState";
import QuantitySelector from "../../components/ecommerce/QuantitySelector";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' fill='%23333'%3E%3Crect width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666' font-size='10'%3ENo%3C/text%3E%3C/svg%3E";

export default function CartPage() {
  const {
    cart,
    cartCount,
    cartLoading,
    fetchCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  } = useEcommerceStore();

  const [clearing, setClearing] = useState(false);
  const [removingItems, setRemovingItems] = useState(new Set());
  const [updatingItems, setUpdatingItems] = useState(new Set());

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleQuantityChange = async (itemId, newQuantity) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId));
    try {
      const res = await updateCartItem(itemId, newQuantity);
      if (!res.success) {
        toast.error(res.message || "Failed to update quantity");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleRemoveItem = async (itemId) => {
    setRemovingItems((prev) => new Set(prev).add(itemId));
    try {
      const res = await removeFromCart(itemId);
      if (res.success) {
        toast.success("Item removed");
      } else {
        toast.error(res.message || "Failed to remove item");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setRemovingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const handleClearCart = async () => {
    setClearing(true);
    try {
      const res = await clearCart();
      if (res.success) {
        toast.success("Cart cleared");
      } else {
        toast.error(res.message || "Failed to clear cart");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setClearing(false);
    }
  };

  const handleOrderCartViaWhatsApp = () => {
    if (items.length === 0) return;

    let itemsMessage = "";
    items.forEach((item, idx) => {
      const product = item.product || item;
      const itemPrice = item.price || product.price || 0;
      const discount = product.discount || 0;
      const discPrice = discount > 0 ? itemPrice - (itemPrice * discount) / 100 : itemPrice;
      
      itemsMessage += `${idx + 1}. *${product.name}* (Size: ${item.size || "N/A"}, Qty: ${item.quantity}) - ${formatPrice(discPrice * item.quantity)}\n`;
    });

    const message = `Hello Saajsakhee, I would like to order the following items from my cart:

${itemsMessage}
*Subtotal*: ${formatPrice(subtotal)}
${totalDiscount > 0 ? `*Discount*: -${formatPrice(totalDiscount)}\n` : ""}${deliveryCharge > 0 ? `*Delivery*: ${formatPrice(deliveryCharge)}\n` : "*Delivery*: Free\n"}*Total*: ${formatPrice(total)}`;

    const whatsappUrl = `https://wa.me/919022565195?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank");
  };


  if (cartLoading) {
    return (
      <div className="min-h-screen bg-surface-900">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <LoadingSkeleton type="list" count={3} />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = items.reduce(
    (sum, item) => sum + (item.price || item.product?.price || 0) * item.quantity,
    0
  );
  const totalDiscount = items.reduce((sum, item) => {
    const p = item.product || item;
    const discount = p.discount || 0;
    const itemPrice = item.price || p.price || 0;
    return sum + (itemPrice * discount * item.quantity) / 100;
  }, 0);
  const deliveryCharge = subtotal >= 999 ? 0 : 99;
  const total = subtotal - totalDiscount + deliveryCharge;

  return (
    <div className="min-h-screen bg-surface-900">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
                Shopping Cart
              </h1>
              <p className="text-sm text-text-muted mt-1">
                {cartCount} item{cartCount !== 1 ? "s" : ""} in your cart
              </p>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors text-sm"
            >
              <ArrowLeft size={16} />
              Continue Shopping
            </Link>
          </div>

          {items.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              title="Your cart is empty"
              description="Looks like you haven't added anything to your cart yet. Start shopping to fill it up!"
              actionLabel="Start Shopping"
              actionLink="/shop"
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {items.map((item) => {
                  const product = item.product || item;
                  const itemPrice = item.price || product.price || 0;
                  const discount = product.discount || 0;
                  const discPrice =
                    discount > 0
                      ? itemPrice - (itemPrice * discount) / 100
                      : itemPrice;
                  const itemTotal = discPrice * item.quantity;
                  const imageUrl =
                    product.images?.[0]?.url ||
                    product.images?.[0] ||
                    fallbackImage;
                  const isRemoving = removingItems.has(item._id);
                  const isUpdating = updatingItems.has(item._id);

                  return (
                    <div
                      key={item._id}
                      className={`relative bg-surface-800 border border-surface-700/50 rounded-2xl p-4 sm:p-5 transition-all duration-300 ${
                        isRemoving
                          ? "opacity-50 scale-[0.97] pointer-events-none"
                          : ""
                      }`}
                    >
                      <div className="flex gap-4 sm:gap-5">
                        {/* Image */}
                        <Link
                                to={`/shop/${product.slug || product._id}`}
                          className="shrink-0"
                        >
                          <div className="w-20 h-24 sm:w-24 sm:h-28 rounded-xl overflow-hidden bg-surface-700">
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = fallbackImage;
                              }}
                            />
                          </div>
                        </Link>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <Link
              to={`/shop/${product.slug || product._id}`}
                                className="text-sm sm:text-base font-medium text-text-primary hover:text-accent transition-colors line-clamp-1"
                              >
                                {product.name}
                              </Link>
                              {item.size && (
                                <p className="text-xs text-text-muted mt-1">
                                  Size:{" "}
                                  <span className="font-medium text-text-secondary">
                                    {item.size}
                                  </span>
                                </p>
                              )}
                            </div>

                            {/* Price */}
                            <div className="text-right shrink-0">
                              <p className="text-sm font-semibold text-accent">
                                {formatPrice(itemTotal)}
                              </p>
                              {discount > 0 && (
                                <p className="text-xs text-text-muted line-through">
                                  {formatPrice(itemPrice * item.quantity)}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            {/* Quantity Selector */}
                            <div className="flex items-center gap-2">
                              <QuantitySelector
                                value={item.quantity}
                                onChange={(val) =>
                                  handleQuantityChange(item._id, val)
                                }
                                min={1}
                                max={10}
                              />
                              {isUpdating && (
                                <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                              )}
                            </div>

                            {/* Remove */}
                            <button
                              onClick={() => handleRemoveItem(item._id)}
                              disabled={isRemoving}
                              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-danger transition-colors disabled:opacity-50"
                            >
                              <Trash2 size={14} />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Clear Cart */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleClearCart}
                    disabled={clearing}
                    className="flex items-center gap-2 text-sm text-text-muted hover:text-danger transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={14} />
                    {clearing ? "Clearing..." : "Clear Cart"}
                  </button>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-28 bg-surface-800 border border-surface-700/50 rounded-2xl p-6 space-y-5">
                  <h3 className="text-base font-semibold text-text-primary">
                    Order Summary
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">Subtotal</span>
                      <span className="text-text-secondary">
                        {formatPrice(subtotal)}
                      </span>
                    </div>
                    {totalDiscount > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-text-muted">Discount</span>
                        <span className="text-success">
                          -{formatPrice(totalDiscount)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">Delivery</span>
                      <span
                        className={
                          deliveryCharge === 0
                            ? "text-success"
                            : "text-text-secondary"
                        }
                      >
                        {deliveryCharge === 0
                          ? "Free"
                          : formatPrice(deliveryCharge)}
                      </span>
                    </div>
                    {deliveryCharge > 0 && (
                      <p className="text-xs text-text-muted">
                        Free delivery on orders above{" "}
                        <span className="text-text-secondary">₹999</span>
                      </p>
                    )}

                    <div className="h-px bg-surface-700" />

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-text-primary">
                        Total
                      </span>
                      <span className="text-lg font-bold text-accent">
                        {formatPrice(total)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={handleOrderCartViaWhatsApp}
                      className="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-green-500/20 hover:shadow-green-500/30 active:scale-[0.98]"
                    >
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.97C16.484 2.012 14.03 1.002 11.99 1.002c-5.447 0-9.873 4.372-9.877 9.802-.001 1.777.469 3.51 1.36 5.031L2.44 20.8l5.127-1.332.08-.047c.001-.001.001-.001.002-.002zm12.361-5.395c-.33-.165-1.951-.951-2.253-1.061-.301-.11-.52-.165-.74.165-.22.33-.852 1.061-1.044 1.281-.192.22-.384.247-.714.082-1.359-.68-2.335-1.18-3.148-2.58-.216-.374.216-.347.618-1.15.066-.138.033-.259-.017-.364-.05-.105-.44-1.06-.603-1.453-.159-.384-.334-.33-.46-.337-.118-.006-.253-.007-.388-.007-.136 0-.356.05-.542.253-.187.203-.712.697-.712 1.7 0 1.003.729 1.972.83 2.11.101.137 1.436 2.193 3.479 3.075.487.21 1.01.272 1.408.21.439-.065 1.348-.551 1.537-1.056.19-.505.19-.938.133-1.029-.056-.091-.207-.145-.537-.31z" />
                      </svg>
                      Order via WhatsApp
                    </button>
                  </div>

                  <Link
                    to="/shop"
                    className="flex items-center justify-center gap-1.5 w-full text-sm text-text-muted hover:text-accent transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
