import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Truck,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Mail,
  Shield,
  BarChart2,
  Package,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { productApi } from "../../api/product.api";
import Navbar from "../../components/ecommerce/Navbar";
import Footer from "../../components/ecommerce/Footer";
import ProductCard from "../../components/ecommerce/ProductCard";
import LoadingSkeleton from "../../components/ecommerce/LoadingSkeleton";
import { userAuthStore } from "../../store/userStore";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    desc: "On orders above ₹999",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payment",
    desc: "100% secure transactions",
  },
  {
    icon: RefreshCw,
    title: "Easy Returns",
    desc: "30-day return policy",
  },
  {
    icon: Sparkles,
    title: "Premium Quality",
    desc: "Handpicked collections",
  },
];

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

export default function Landing() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [heroLoaded, setHeroLoaded] = useState(false);
  const user = userAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [featuredRes, categoriesRes, trendingRes] = await Promise.all([
          productApi.getFeatured(),
          productApi.getCategories(),
          productApi.listProducts({ sort: "popular", limit: 8 }),
        ]);
        if (featuredRes.success) setFeaturedProducts(featuredRes.data || []);
        if (categoriesRes.success) setCategories(categoriesRes.data || []);
        if (trendingRes.success)
          setTrending(trendingRes.data?.products || trendingRes.data || []);
      } catch {
        toast.error("Failed to load content");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      toast.success("Subscribed to newsletter!");
      setNewsletterEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-surface-900">
      <Navbar />

      {/* Admin Banner - visible only to admin users */}
      {isAdmin && (
        <div className="relative z-40 pt-16 lg:pt-20">
          <div
            className="mx-4 sm:mx-6 lg:mx-8 mt-4 rounded-2xl border border-accent/30 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.10) 100%)' }}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center shrink-0">
                  <Shield size={20} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">Admin Control Panel</p>
                  <p className="text-xs text-text-muted mt-0.5">You're logged in as admin — manage your store</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors"
                >
                  <BarChart2 size={14} />
                  Dashboard
                </Link>
                <Link
                  to="/admin/products"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-700 border border-surface-600 text-text-secondary text-xs font-medium hover:text-accent hover:border-accent/40 transition-colors"
                >
                  <Package size={14} />
                  Products
                </Link>
                <Link
                  to="/admin/orders"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-700 border border-surface-600 text-text-secondary text-xs font-medium hover:text-accent hover:border-accent/40 transition-colors"
                >
                  <Shield size={14} />
                  Orders
                </Link>
                <Link
                  to="/admin/users"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-700 border border-surface-600 text-text-secondary text-xs font-medium hover:text-accent hover:border-accent/40 transition-colors"
                >
                  <Users size={14} />
                  Users
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0">
            <div
              className="absolute inset-0 bg-gradient-to-r from-surface-900 via-surface-900/70 to-transparent z-10"
            />
            <div
              className={`absolute inset-0 bg-cover bg-center transition-opacity duration-1000 ${heroLoaded ? "opacity-100" : "opacity-0"
                }`}
              style={{
                backgroundImage:
                  'url("https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&q=80")',
              }}
            />
            <img
              src="https://images.unsplash.com/photo-1445205170230-053b83016050?w=1920&q=80"
              alt=""
              className="hidden"
              onLoad={() => setHeroLoaded(true)}
            />
            <div className="absolute inset-0 bg-surface-900/40" />
          </div>

          {/* Ambient Glow */}
          <div className="absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-0">
            <div className="max-w-2xl animate-fade-in">
              <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-6">
                <Sparkles size={14} className="text-accent" />
                <span className="text-xs font-medium text-accent tracking-wider uppercase">
                  New Season Collection
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-text-primary leading-[1.1] tracking-tight">
                Discover{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-violet">
                  Your Style
                </span>
              </h1>

              <p className="mt-6 text-base sm:text-lg text-text-secondary max-w-lg leading-relaxed">
                Elevate your wardrobe with handpicked pieces that blend tradition
                with contemporary elegance. Curated for those who appreciate the
                finest.
              </p>

              <div className="flex flex-wrap gap-4 mt-8">
                <Link
                  to="/shop"
                  className="group relative inline-flex items-center gap-2 bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  Shop Now
                  <ArrowRight
                    size={18}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </Link>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 border border-surface-600 hover:border-accent/50 text-text-secondary hover:text-accent font-medium px-8 py-3.5 rounded-xl transition-all duration-300"
                >
                  View Collection
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Bar */}
        <section className="relative z-10 -mt-12 pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="bg-surface-800/80 backdrop-blur-sm border border-surface-700/50 rounded-xl p-4 flex items-center gap-3 hover:border-accent/20 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 group-hover:bg-accent/20 transition-colors">
                      <Icon size={18} className="text-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">
                        {feat.title}
                      </p>
                      <p className="text-xs text-text-muted">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em]">
                  Featured
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mt-2">
                  Editor's Pick
                </h2>
                <p className="text-text-muted text-sm mt-1.5">
                  Handpicked styles for the season
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                <LoadingSkeleton type="card" count={4} />
              </div>
            ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-text-muted text-sm">
                No featured products available
              </div>
            )}
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 lg:py-24 bg-surface-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em]">
                Collections
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mt-2">
                Shop by Category
              </h2>
              <p className="text-text-muted text-sm mt-1.5 max-w-md mx-auto">
                Explore our curated categories designed for every occasion
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                <LoadingSkeleton type="card" count={4} />
              </div>
            ) : categories.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {categories.map((cat) => (
                  <Link
                    key={cat._id || cat.slug}
                    to={`/shop?category=${cat.slug}`}
                    className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-surface-800 border border-surface-700/50 hover:border-accent/30 transition-all duration-300"
                  >
                    {cat.image?.url || cat.image ? (
                      <img
                        src={cat.image?.url || cat.image}
                        alt={cat.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-accent/20 to-violet/20 flex items-center justify-center">
                        <span className="text-4xl font-bold text-accent/30">
                          {cat.name?.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-5">
                      <h3 className="text-base lg:text-lg font-semibold text-text-primary group-hover:text-accent transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-text-muted mt-0.5 flex items-center gap-1">
                        <span>Explore</span>
                        <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-text-muted text-sm">
                No categories available
              </div>
            )}
          </div>
        </section>

        {/* Trending Now */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-xs font-semibold text-accent uppercase tracking-[0.2em]">
                  Trending
                </span>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary mt-2">
                  Trending Now
                </h2>
                <p className="text-text-muted text-sm mt-1.5">
                  Most popular styles this week
                </p>
              </div>
              <Link
                to="/shop?sort=popular"
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-light transition-colors"
              >
                View All
                <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                <LoadingSkeleton type="card" count={4} />
              </div>
            ) : trending.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {trending.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-text-muted text-sm">
                No trending products available
              </div>
            )}

            <div className="mt-8 text-center sm:hidden">
              <Link
                to="/shop?sort=popular"
                className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-light transition-colors"
              >
                View All Trending
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-16 lg:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-violet/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/3 rounded-full blur-[150px] pointer-events-none" />

          <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 mb-6">
              <Mail size={24} className="text-accent" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text-primary">
              Stay in the Loop
            </h2>
            <p className="text-text-muted text-sm mt-3 max-w-md mx-auto leading-relaxed">
              Subscribe to get notified about new arrivals, exclusive drops, and
              special offers delivered to your inbox.
            </p>
            <form
              onSubmit={handleNewsletter}
              className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 bg-surface-800 border border-surface-600 rounded-xl px-5 py-3.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
              />
              <button
                type="submit"
                className="bg-accent hover:bg-accent/90 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-accent/20 hover:shadow-accent/30 active:scale-[0.98]"
              >
                Subscribe
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
