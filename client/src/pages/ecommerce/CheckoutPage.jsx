import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShoppingBag,
  ArrowLeft,
  CheckCircle,
  MapPin,
  Phone,
  User,
  Home,
  Loader2,
  ExternalLink
} from "lucide-react";
import toast from "react-hot-toast";
import { orderApi } from "../../api/order.api";
import { useEcommerceStore } from "../../store/useEcommerceStore";
import Navbar from "../../components/ecommerce/Navbar";
import Footer from "../../components/ecommerce/Footer";
import LoadingSkeleton from "../../components/ecommerce/LoadingSkeleton";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const fallbackImage =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' fill='%23333'%3E%3Crect width='60' height='60'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23666' font-size='8'%3ENo%3C/text%3E%3C/svg%3E";

const initialForm = {
  name: "",
  phone: "",
  address: "",
  city: "",
  pincode: "",
};

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartCount, cartLoading, fetchCart } = useEcommerceStore();

  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = useCallback(() => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Full name is required";
    if (!form.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[0-9]{10}$/.test(form.phone.trim()))
      newErrors.phone = "Enter a valid 10-digit phone number";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.city.trim()) newErrors.city = "City is required";
    if (!form.pincode.trim()) newErrors.pincode = "Pincode is required";
    else if (!/^[0-9]{6}$/.test(form.pincode.trim()))
      newErrors.pincode = "Enter a valid 6-digit pincode";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setPlacing(true);
    try {
      const res = await orderApi.placeOrder({
        shippingAddress: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          pincode: form.pincode.trim(),
        }
      });
      if (res.success) {
        setOrderSuccess(res.data);
        toast.success("Order placed successfully!");
        if (res.data.whatsappUrl) {
          window.open(res.data.whatsappUrl, "_blank");
        }
      } else {
        toast.error(res.message || "Failed to place order");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setPlacing(false);
    }
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-surface-900">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <LoadingSkeleton type="detail" count={1} />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const items = cart?.items || [];
  const subtotal = items.reduce(
    (sum, item) =>
      sum + (item.price || item.product?.price || 0) * item.quantity,
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

  if (items.length === 0 && !cartLoading) {
    navigate("/cart", { replace: true });
    return null;
  }

  if (orderSuccess) {
    const order = orderSuccess.order || orderSuccess;
    return (
      <div className="min-h-screen bg-surface-900">
        <Navbar />
        <main className="pt-24 pb-16 min-h-[80vh] flex items-center justify-center">
          <div className="max-w-lg mx-auto px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={44} className="text-success" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-2">
              Order Placed Successfully!
            </h2>
            <p className="text-text-muted text-sm mb-6">
              Thank you for your order. Your order has been placed and we will contact you shortly.
            </p>

            <div className="bg-surface-800 border border-gold-500/20 rounded-2xl p-6 mb-8 text-left space-y-3 shadow-[0_8px_30px_rgba(212,175,55,0.05)]">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Order ID</span>
                <span className="text-text-primary font-medium">
                  {order.orderId || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Items</span>
                <span className="text-text-primary font-medium">
                  {items.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-muted">Total</span>
                <span className="text-lg font-bold text-accent">
                  {formatPrice(total)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/orders"
                className="text-sm font-medium text-accent hover:text-accent-light transition-colors"
              >
                View My Orders
              </Link>
              <Link
                to="/shop"
                className="text-sm text-text-muted hover:text-accent transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-900">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Checkout
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Complete your order by filling in the details below
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
            <div className="lg:col-span-3">
              <form onSubmit={handlePlaceOrder}>
                <div className="bg-surface-800 border border-surface-600/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                  <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                    <MapPin size={18} className="text-accent" />
                    Shipping Address
                  </h2>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className={`w-full bg-surface-700 border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 transition-all ${errors.name
                          ? "border-danger focus:border-danger focus:ring-danger/30"
                          : "border-surface-600 focus:border-accent focus:ring-accent/30"
                          }`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-xs text-danger mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="9876543210"
                        maxLength={10}
                        className={`w-full bg-surface-700 border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 transition-all ${errors.phone
                          ? "border-danger focus:border-danger focus:ring-danger/30"
                          : "border-surface-600 focus:border-accent focus:ring-accent/30"
                          }`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-danger mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1.5">
                      Address
                    </label>
                    <div className="relative">
                      <Home size={16} className="absolute left-3.5 top-3.5 text-text-muted" />
                      <textarea
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Street, building, area..."
                        rows={3}
                        className={`w-full bg-surface-700 border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 transition-all resize-none ${errors.address
                          ? "border-danger focus:border-danger focus:ring-danger/30"
                          : "border-surface-600 focus:border-accent focus:ring-accent/30"
                          }`}
                      />
                    </div>
                    {errors.address && (
                      <p className="text-xs text-danger mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">
                        City
                      </label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
                        <input
                          type="text"
                          name="city"
                          value={form.city}
                          onChange={handleChange}
                          placeholder="Mumbai"
                          className={`w-full bg-surface-700 border rounded-xl pl-10 pr-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 transition-all ${errors.city
                            ? "border-danger focus:border-danger focus:ring-danger/30"
                            : "border-surface-600 focus:border-accent focus:ring-accent/30"
                            }`}
                        />
                      </div>
                      {errors.city && (
                        <p className="text-xs text-danger mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-1.5">
                        Pincode
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="pincode"
                          value={form.pincode}
                          onChange={handleChange}
                          placeholder="400001"
                          maxLength={6}
                          className={`w-full bg-surface-700 border rounded-xl pl-4 pr-4 py-3 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-1 transition-all ${errors.pincode
                            ? "border-danger focus:border-danger focus:ring-danger/30"
                            : "border-surface-600 focus:border-accent focus:ring-accent/30"
                            }`}
                        />
                      </div>
                      {errors.pincode && (
                        <p className="text-xs text-danger mt-1">{errors.pincode}</p>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={placing}
                  className="w-full mt-6 flex items-center justify-center gap-2 bg-gradient-to-r from-gold-200 via-gold-500 to-gold-600 text-neutral-950 font-bold py-4 rounded-xl transition-all duration-300 shadow-[0_4px_20px_-3px_rgba(212,175,55,0.35)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {placing ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : null}
                  {placing ? "Placing Order..." : `Place Order - ${formatPrice(total)}`}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2">
              <div className="sticky top-28 bg-surface-800 border border-surface-600/30 rounded-2xl p-6 space-y-5 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
                <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                  <ShoppingBag size={18} className="text-accent" />
                  Order Summary
                </h3>

                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {items.map((item) => {
                    const product = item.product || item;
                    const itemPrice = item.price || product.price || 0;
                    const discount = product.discount || 0;
                    const discPrice =
                      discount > 0
                        ? itemPrice - (itemPrice * discount) / 100
                        : itemPrice;
                    const imageUrl =
                      product.images?.[0]?.url ||
                      product.images?.[0] ||
                      fallbackImage;

                    return (
                      <div key={item._id} className="flex items-center gap-3">
                        <div className="w-14 h-16 rounded-lg overflow-hidden bg-surface-950 border border-surface-600/40 shrink-0">
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.src = fallbackImage; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-text-muted">
                            Qty: {item.quantity}
                            {item.size && ` | Size: ${item.size}`}
                          </p>
                          <p className="text-sm font-medium text-accent mt-0.5">
                            {formatPrice(discPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="h-px bg-surface-700" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Subtotal</span>
                    <span className="text-text-secondary">{formatPrice(subtotal)}</span>
                  </div>
                  {totalDiscount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-muted">Discount</span>
                      <span className="text-success">-{formatPrice(totalDiscount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-text-muted">Delivery</span>
                    <span className={deliveryCharge === 0 ? "text-success" : "text-text-secondary"}>
                      {deliveryCharge === 0 ? "Free" : formatPrice(deliveryCharge)}
                    </span>
                  </div>
                  {deliveryCharge > 0 && (
                    <p className="text-xs text-text-muted">
                      Free delivery on orders above <span className="text-text-secondary">Rs.999</span>
                    </p>
                  )}

                  <div className="h-px bg-surface-700" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-text-primary">Total</span>
                    <span className="text-lg font-bold text-accent">{formatPrice(total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
