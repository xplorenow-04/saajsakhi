import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IoChevronBack, IoHeartOutline, IoHeart, IoShareSocial, IoCheckmark, IoAdd, IoRemove, IoLogoWhatsapp } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { productApi } from '../../api/product.api';
import { useShopStore } from '../../store/shopStore';
import { Button, Badge, Skeleton, ProductCard } from '../../components/ui';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, featuredProducts, fetchFeaturedProducts } = useShopStore();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(0);
  const [imgLoaded, setImgLoaded] = useState({});
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const res = await productApi.getProductById(id);
      if (res.success) {
        setProduct(res.data);
        setSelectedSize(res.data.sizes?.[0]?.size || '');
      } else {
        setError(res.message);
      }
      setLoading(false);
    };
    fetchProduct();
    fetchFeaturedProducts();
    window.scrollTo(0, 0);
  }, [id]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const discountedPrice = product?.discount > 0 ? product.price - product.discount : null;

  const handleAddToCart = async () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    if (adding) return;
    setAdding(true);
    const result = await addToCart(product._id, quantity, selectedSize);
    if (result.success) {
      toast.success('Added to cart');
    } else {
      toast.error(result.message);
    }
    setAdding(false);
  };

  const handleWhatsApp = () => {
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }
    const price = discountedPrice || product.price;
    const msg = `*Interest in Product - SAAJSAKHI*\n\n*Product:* ${product.name}\n*Size:* ${selectedSize}\n*Quantity:* ${quantity}\n*Price:* ₹${price.toLocaleString()}\n*URL:* ${window.location.href}`;
    window.open(`https://wa.me/9022565195?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <Skeleton className="aspect-[3/4] rounded-3xl" />
          <div className="space-y-6">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display italic mb-4">Product Not Found</h2>
          <p className="text-secondary mb-6">{error || 'This product does not exist.'}</p>
          <Button onClick={() => navigate('/shop')}>Back to Shop</Button>
        </div>
      </div>
    );
  }

  const relatedProducts = featuredProducts.filter(p => p._id !== product._id).slice(0, 4);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-secondary hover:text-primary mb-8 transition-colors">
          <IoChevronBack />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div
              className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-surface2 cursor-crosshair group"
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
              onMouseMove={handleMouseMove}
            >
              {!imgLoaded[mainImage] && <div className="absolute inset-0 skeleton" />}
              <img
                src={product.images?.[mainImage]?.url || product.images?.[mainImage]}
                alt={product.name}
                onLoad={() => setImgLoaded(prev => ({ ...prev, [mainImage]: true }))}
                className={`w-full h-full object-cover transition-all duration-700 ${imgLoaded[mainImage] ? 'opacity-100' : 'opacity-0'}`}
              />
              {product.discount > 0 && (
                <div className="absolute top-4 left-4">
                  <Badge variant="gradient">-{Math.round((product.discount / product.price) * 100)}% OFF</Badge>
                </div>
              )}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button onClick={() => { setIsWishlisted(!isWishlisted); toast.success(isWishlisted ? 'Removed' : 'Saved'); }} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-all">
                  {isWishlisted ? <IoHeart size={18} className="text-danger" /> : <IoHeartOutline size={18} />}
                </button>
                <button className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition-all">
                  <IoShareSocial size={18} />
                </button>
              </div>

              {/* Zoom Lens */}
              <AnimatePresence>
                {zoom && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `url(${product.images?.[mainImage]?.url || product.images?.[mainImage]})`,
                      backgroundSize: '200%',
                      backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                    }}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setMainImage(i)}
                    className={`w-20 h-24 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      mainImage === i ? 'border-accent' : 'border-border hover:border-accent/50'
                    }`}
                  >
                    <img src={img?.url || img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <div className="space-y-6">
              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-1">{product.category}</p>
                <h1 className="text-3xl md:text-4xl font-display italic leading-tight">{product.name}</h1>
              </div>

              <div className="flex items-baseline gap-3">
                {discountedPrice ? (
                  <>
                    <span className="text-3xl font-bold">₹{discountedPrice.toLocaleString()}</span>
                    <span className="text-lg text-muted line-through">₹{product.price.toLocaleString()}</span>
                    <Badge variant="success">Save ₹{product.discount.toLocaleString()}</Badge>
                  </>
                ) : (
                  <span className="text-3xl font-bold">₹{product.price.toLocaleString()}</span>
                )}
              </div>

              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-1.5 ${product.stock > 0 ? 'text-success' : 'text-danger'}`}>
                  <span className="w-2 h-2 rounded-full bg-current" />
                  <span className="text-sm font-medium">
                    {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted uppercase tracking-wider mb-3">Description</p>
                <p className="text-secondary leading-relaxed">{product.description}</p>
              </div>

              {product.material && (
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-1">Material</p>
                  <p className="text-sm">{product.material}</p>
                </div>
              )}

              {/* Size Selection */}
              {product.stock > 0 && (
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-3">Select Size</p>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes?.map(s => (
                      <button
                        key={s.size}
                        onClick={() => setSelectedSize(s.size)}
                        className={`w-14 h-14 rounded-xl text-sm font-medium border-2 transition-all ${
                          selectedSize === s.size
                            ? 'border-accent bg-accent/10 text-accent'
                            : 'border-border bg-surface2 text-secondary hover:border-accent/30 hover:text-primary'
                        }`}
                      >
                        {s.size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              {product.stock > 0 && (
                <div>
                  <p className="text-xs text-muted uppercase tracking-wider mb-3">Quantity</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-surface2 transition-all"
                    >
                      <IoRemove size={16} />
                    </button>
                    <span className="w-10 text-center font-semibold text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 rounded-xl border border-border flex items-center justify-center hover:bg-surface2 transition-all"
                    >
                      <IoAdd size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-10 space-y-3">
              <Button
                size="lg"
                className="w-full accent-gradient text-white border-0"
                onClick={handleAddToCart}
                loading={adding}
                disabled={product.stock === 0}
              >
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full border-success/30 text-success hover:bg-success/5"
                onClick={handleWhatsApp}
                disabled={product.stock === 0}
              >
                <IoLogoWhatsapp size={20} className="mr-2" />
                Buy via WhatsApp
              </Button>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <h2 className="text-2xl md:text-3xl font-display italic mb-8">You May Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((p, i) => (
                <ProductCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
