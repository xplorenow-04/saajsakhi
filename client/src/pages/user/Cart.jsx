import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoTrashOutline, IoBagOutline, IoArrowBack } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { useShopStore } from '../../store/shopStore';
import { orderApi } from '../../api/order.api';
import { Button, QuantitySelector } from '../../components/ui';

export default function Cart() {
  const navigate = useNavigate();
  const {
    cart, fetchCart, updateCartItem, removeFromCart, clearCart, getCartTotal, cartLoading,
  } = useShopStore();
  const [shipping, setShipping] = useState({ name: '', phone: '', address: '', city: '', pincode: '' });
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState('cart');

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleInput = (e) => {
    setShipping(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleQuantity = async (productId, newQty, size) => {
    if (newQty < 1) return;
    const res = await updateCartItem(productId, newQty, size);
    if (!res.success) toast.error(res.message);
  };

  const handleRemove = async (productId, size) => {
    const res = await removeFromCart(productId, size);
    if (res.success) toast.success('Item removed');
    else toast.error(res.message);
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (!shipping.name || !shipping.phone || !shipping.address || !shipping.city || !shipping.pincode) {
      toast.error('Please fill all shipping fields');
      return;
    }
    setSubmitting(true);
    const res = await orderApi.placeOrder(shipping);
    setSubmitting(false);
    if (res.success) {
      toast.success('Order placed!');
      clearCart();
      navigate('/profile/orders');
    } else {
      toast.error(res.message || 'Failed to place order');
    }
  };

  const total = getCartTotal();
  const items = cart?.items || [];
  const shippingCost = total > 999 ? 0 : 99;
  const grandTotal = total + shippingCost;

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/shop" className="p-2 rounded-full hover:bg-surface2 transition-all">
            <IoArrowBack size={20} />
          </Link>
          <h1 className="text-3xl md:text-4xl font-display italic">Shopping Cart</h1>
        </div>

        {/* Steps Indicator */}
        <div className="flex items-center gap-2 mb-10">
          {['Cart', 'Shipping', 'Confirm'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                (step === 'cart' && i === 0) || (step === 'shipping' && i <= 1) || step === 'confirm'
                  ? 'accent-gradient text-white'
                  : 'bg-surface2 text-muted'
              }`}>
                {(step === 'shipping' && i < 1) || step === 'confirm' ? '✓' : i + 1}
              </div>
              <span className={`text-xs ${i === 0 && step === 'cart' ? 'text-primary font-medium' : 'text-muted'}`}>{s}</span>
              {i < 2 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-full bg-surface2 flex items-center justify-center mx-auto mb-6">
              <IoBagOutline size={40} className="text-muted" />
            </div>
            <h2 className="text-2xl font-display italic mb-3">Your cart is empty</h2>
            <p className="text-secondary mb-8">Looks like you haven't added anything yet.</p>
            <Button onClick={() => navigate('/shop')}>Continue Shopping</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Cart Items */}
            <div className="lg:col-span-7 space-y-4">
              {items.map((item, i) => {
                const p = item.product;
                if (!p) return null;
                const price = p.discount > 0 ? p.price - p.discount : p.price;
                return (
                  <motion.div
                    key={`${p._id}-${item.size}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-4 p-4 rounded-2xl border border-border bg-surface/50"
                  >
                    <Link to={`/product/${p._id}`}>
                      <img src={p.images?.[0]?.url || p.images?.[0]} alt={p.name} className="w-24 h-28 object-cover rounded-xl" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted uppercase tracking-wider">{p.category}</p>
                      <Link to={`/product/${p._id}`} className="text-sm font-semibold hover:text-accent transition-colors line-clamp-1">
                        {p.name}
                      </Link>
                      <p className="text-xs text-muted mt-0.5">Size: {item.size}</p>
                      <div className="flex items-center justify-between mt-3">
                        <QuantitySelector
                          quantity={item.quantity}
                          onIncrease={() => handleQuantity(p._id, item.quantity + 1, item.size)}
                          onDecrease={() => handleQuantity(p._id, item.quantity - 1, item.size)}
                        />
                        <div className="text-right">
                          <p className="font-semibold">₹{(price * item.quantity).toLocaleString()}</p>
                          {p.discount > 0 && (
                            <p className="text-xs text-muted line-through">₹{(p.price * item.quantity).toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(p._id, item.size)}
                      className="p-2 rounded-full hover:bg-danger/10 text-muted hover:text-danger transition-all self-start"
                    >
                      <IoTrashOutline size={16} />
                    </button>
                  </motion.div>
                );
              })}
            </div>

            {/* Order Summary + Checkout */}
            <div className="lg:col-span-5">
              <div className="sticky top-28 p-6 rounded-2xl border border-border bg-surface/50 space-y-6">
                <h3 className="font-semibold text-lg">Order Summary</h3>

                <div className="space-y-3">
                  {step !== 'cart' && (
                    <div className="space-y-3 pb-6 border-b border-border">
                      <h4 className="text-xs text-muted uppercase tracking-wider">Shipping Details</h4>
                      <input name="name" value={shipping.name} onChange={handleInput} placeholder="Full Name" className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent" required />
                      <input name="phone" value={shipping.phone} onChange={handleInput} placeholder="Phone Number" className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent" required />
                      <textarea name="address" value={shipping.address} onChange={handleInput} placeholder="Street Address" rows={2} className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent resize-none" required />
                      <div className="grid grid-cols-2 gap-3">
                        <input name="city" value={shipping.city} onChange={handleInput} placeholder="City" className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent" required />
                        <input name="pincode" value={shipping.pincode} onChange={handleInput} placeholder="Pincode" className="w-full bg-surface2 border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-accent" required />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-secondary">Subtotal</span>
                      <span>₹{total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">Shipping</span>
                      <span className={shippingCost === 0 ? 'text-success' : ''}>
                        {shippingCost === 0 ? 'FREE' : `₹${shippingCost}`}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold pt-3 border-t border-border">
                      <span>Total</span>
                      <span className="accent-gradient-text">₹{grandTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {step === 'cart' ? (
                  <Button size="lg" className="w-full accent-gradient text-white border-0" onClick={() => setStep('shipping')}>
                    Continue to Shipping
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="w-full accent-gradient text-white border-0"
                    onClick={handlePlaceOrder}
                    loading={submitting}
                  >
                    Place Order
                  </Button>
                )}
                {step !== 'cart' && (
                  <button onClick={() => setStep('cart')} className="w-full text-center text-sm text-secondary hover:text-primary transition-all">
                    Back to Cart
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
