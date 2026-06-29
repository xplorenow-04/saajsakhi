import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoHeart, IoTrashOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { Button, EmptyState } from '../../components/ui';
import { useShopStore } from '../../store/shopStore';

// Wishlist is client-side only (no backend endpoint)
// Uses localStorage for persistence
export default function Wishlist() {
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('wishlist') || '[]');
    } catch { return []; }
  });
  const { addToCart } = useShopStore();

  const removeFromWishlist = (id) => {
    const updated = wishlist.filter(item => item._id !== id);
    setWishlist(updated);
    localStorage.setItem('wishlist', JSON.stringify(updated));
    toast.success('Removed from wishlist');
  };

  const handleAddToCart = async (item) => {
    const size = item.sizes?.[0]?.size || 'M';
    const res = await addToCart(item._id, 1, size);
    if (res.success) {
      toast.success('Added to cart');
    } else {
      toast.error(res.message);
    }
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <EmptyState
            icon={IoHeart}
            title="Your wishlist is empty"
            description="Save your favorite items here."
            action="Browse Products"
            onAction={() => window.location.href = '/shop'}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl md:text-4xl font-display italic mb-2">Wishlist</h1>
        <p className="text-secondary mb-10">{wishlist.length} saved items</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlist.map((item, i) => {
            const price = item.discount > 0 ? item.price - item.discount : item.price;
            return (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="group"
              >
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface2 mb-3">
                  <img src={item.images?.[0]?.url || item.images?.[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                  <button
                    onClick={() => removeFromWishlist(item._id)}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-all"
                  >
                    <IoTrashOutline size={16} className="text-danger" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="w-full py-2.5 rounded-full bg-white text-gray-900 text-sm font-medium hover:bg-gray-100 transition-all"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
                <Link to={`/product/${item._id}`}>
                  <p className="text-xs text-muted uppercase tracking-wider">{item.category}</p>
                  <h3 className="font-medium truncate">{item.name}</h3>
                  <p className="font-semibold">₹{price.toLocaleString()}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
