import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose, IoTrashOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { useShopStore } from '../../store/shopStore';
import { CartSkeleton } from '../ui/Skeleton';
import QuantitySelector from '../ui/QuantitySelector';

export default function CartDrawer({ isOpen, onClose }) {
  const { cart, cartLoading, fetchCart, removeFromCart, updateCartItem, getCartTotal } = useShopStore();

  useEffect(() => {
    if (isOpen) fetchCart();
  }, [isOpen, fetchCart]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleRemove = async (productId, size) => {
    const res = await removeFromCart(productId, size);
    if (res.success) toast.success('Removed from cart');
    else toast.error(res.message);
  };

  const handleQuantity = async (productId, newQty, size) => {
    if (newQty < 1) return;
    await updateCartItem(productId, newQty, size);
  };

  const total = getCartTotal();
  const products = cart?.products || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute top-0 bottom-0 right-0 w-full max-w-lg bg-surface border-l border-border shadow-xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold">Shopping Cart ({products.length})</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-surface2 transition-all">
                <IoClose size={20} />
              </button>
            </div>

            <div className="overflow-y-auto h-[calc(100%-180px)] p-6">
              {cartLoading ? (
                <CartSkeleton />
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <IoBagOutline size={48} className="text-muted mb-4" />
                  <p className="text-secondary mb-2">Your cart is empty</p>
                  <button onClick={onClose} className="text-accent text-sm font-medium hover:underline">
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((item) => {
                    const p = item.product;
                    if (!p) return null;
                    const price = p.discount > 0 ? p.price - p.discount : p.price;
                    return (
                      <motion.div
                        key={`${p._id}-${item.size}`}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-4 p-3 rounded-xl bg-surface2/50"
                      >
                        <Link to={`/product/${p._id}`} onClick={onClose}>
                          <img
                            src={p.images?.[0]}
                            alt={p.name}
                            className="w-20 h-24 object-cover rounded-lg"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            to={`/product/${p._id}`}
                            onClick={onClose}
                            className="text-sm font-medium hover:text-accent transition-colors line-clamp-1"
                          >
                            {p.name}
                          </Link>
                          <p className="text-xs text-muted mt-0.5">Size: {item.size}</p>
                          <p className="text-sm font-semibold mt-1">₹{price.toLocaleString()}</p>
                          <div className="flex items-center justify-between mt-2">
                            <QuantitySelector
                              quantity={item.quantity}
                              onIncrease={() => handleQuantity(p._id, item.quantity + 1, item.size)}
                              onDecrease={() => handleQuantity(p._id, item.quantity - 1, item.size)}
                            />
                            <button
                              onClick={() => handleRemove(p._id, item.size)}
                              className="p-1.5 rounded-full hover:bg-danger/10 text-muted hover:text-danger transition-all"
                            >
                              <IoTrashOutline size={16} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>

            {products.length > 0 && (
              <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border bg-surface">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-secondary">Subtotal</span>
                  <span className="text-lg font-semibold">₹{total.toLocaleString()}</span>
                </div>
                <Link
                  to="/cart"
                  onClick={onClose}
                  className="block w-full py-3.5 rounded-full accent-gradient text-white text-center font-medium hover:shadow-lg hover:shadow-accent/25 transition-all"
                >
                  View Cart
                </Link>
                <button
                  onClick={onClose}
                  className="w-full text-center text-sm text-secondary mt-3 hover:text-primary transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
