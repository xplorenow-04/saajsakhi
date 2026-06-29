import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoHeartOutline, IoHeart, IoEyeOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { useShopStore } from '../../store/shopStore';
import Badge from './Badge';

const ProductCard = memo(({ product, index = 0 }) => {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const { addToCart } = useShopStore();
  const [adding, setAdding] = useState(false);

  const discountedPrice = product.discount > 0
    ? product.price - product.discount
    : product.price;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (adding) return;
    setAdding(true);
    const size = product.sizes?.[0]?.size || 'M';
    const result = await addToCart(product._id, 1, size);
    if (result.success) {
      toast.success('Added to cart');
    } else {
      toast.error(result.message);
    }
    setAdding(false);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <Link to={`/product/${product._id}`} className="group block">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface2 mb-4">
          {!imgLoaded && <div className="absolute inset-0 skeleton" />}
          <motion.img
            src={product.images?.[0]?.url || product.images?.[0]}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-500" />

          {product.discount > 0 && (
            <div className="absolute top-3 left-3">
              <Badge variant="gradient">
                -{Math.round((product.discount / product.price) * 100)}%
              </Badge>
            </div>
          )}

          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleWishlist}
              className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-all"
            >
              {isWishlisted ? (
                <IoHeart size={16} className="text-danger" />
              ) : (
                <IoHeartOutline size={16} className="text-gray-700" />
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-all"
            >
              <IoEyeOutline size={16} className="text-gray-700" />
            </motion.button>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-2 group-hover:translate-y-0">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddToCart}
              disabled={adding}
              className="w-full py-2.5 rounded-full bg-white text-gray-900 text-sm font-medium hover:bg-gray-100 transition-all"
            >
              {adding ? 'Adding...' : 'Add to Cart'}
            </motion.button>
          </div>
        </div>

        <div className="space-y-1 px-1">
          <p className="text-xs text-muted uppercase tracking-wider">{product.category}</p>
          <h3 className="font-medium text-primary truncate">{product.name}</h3>
          <div className="flex items-center gap-2">
            {product.discount > 0 ? (
              <>
                <span className="font-semibold text-primary">₹{discountedPrice.toLocaleString()}</span>
                <span className="text-sm text-muted line-through">₹{product.price.toLocaleString()}</span>
              </>
            ) : (
              <span className="font-semibold text-primary">₹{product.price.toLocaleString()}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';
export default ProductCard;
