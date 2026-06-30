import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight, Truck, ShieldCheck, RefreshCw, Sparkles,
  Mail, Shield, BarChart2, Package, Users, Star,
  ChevronRight, Heart,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { productApi } from "../../api/product.api";
import Navbar from "../../components/ecommerce/Navbar";
import Footer from "../../components/ecommerce/Footer";
import ProductCard from "../../components/ecommerce/ProductCard";
import LoadingSkeleton from "../../components/ecommerce/LoadingSkeleton";
import { userAuthStore } from "../../store/userStore";

// Hero images — warm editorial fashion
const HERO_IMAGES = [
  "https://plus.unsplash.com/premium_photo-1671198905435-20f8d166efb2?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://plus.unsplash.com/premium_photo-1701204056531-f82d31308f1f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0",
  "https://images.unsplash.com/photo-1778856920032-328a86d21a22?q=80&w=1174&auto=format&fit=crop&ixlib=rb-4.1.0",
];

const features = [
  { icon: Truck,       title: "Free Shipping",    desc: "On orders above ₹999" },
  { icon: ShieldCheck, title: "Secure Payment",   desc: "100% secure transactions" },
  { icon: RefreshCw,   title: "Easy Returns",     desc: "30-day return policy" },
  { icon: Sparkles,    title: "Premium Quality",  desc: "Handpicked collections" },
];

const stats = [
  { value: "500+",  label: "Styles" },
  { value: "10K+",  label: "Happy Customers" },
  { value: "4.8",   label: "Customer Rating" },
  { value: "100%",  label: "Sustainable" },
];

const testimonials = [
  { name: "Priya S.", rating: 5, text: "The quality is absolutely stunning. I get compliments every time I wear pieces from Saajsakhee!", avatar: "P" },
  { name: "Ananya M.", rating: 5, text: "Finally a brand that understands modern Indian women. The fabrics are so luxurious and the fits are perfect.", avatar: "A" },
  { name: "Sneha R.", rating: 5, text: "My go-to for occasion wear. Elegant, tasteful, and always delivered on time.", avatar: "S" },
];

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

export default function Landing() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const user = userAuthStore((s) => s.user);
  const isAdmin = user?.role === "admin";

  // Hero auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

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
        if (trendingRes.success) setTrending(trendingRes.data?.products || trendingRes.data || []);
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
    <div className="min-h-screen bg-lux-bg">
      <Navbar />

      {/* Admin Banner */}
      {isAdmin && (
        <div className="relative z-40 pt-28">
          <div className="mx-4 sm:mx-6 lg:mx-8 rounded-2xl border border-lux-accent/25 bg-lux-light overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lux-accent/10 flex items-center justify-center shrink-0 border border-lux-accent/20">
                  <Shield size={20} className="text-lux-accent" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-lux-text">Admin Control Panel</p>
                  <p className="text-xs text-lux-muted mt-0.5">You're logged in as admin — manage your store</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link to="/admin" className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-lux-accent text-white text-xs font-semibold hover:bg-lux-hover transition-all shadow-warm-sm">
                  <BarChart2 size={13} /> Dashboard
                </Link>
                <Link to="/admin/products" className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-lux-border text-lux-muted text-xs font-medium hover:text-lux-accent hover:border-lux-accent/30 transition-colors">
                  <Package size={13} /> Products
                </Link>
                <Link to="/admin/orders" className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-lux-border text-lux-muted text-xs font-medium hover:text-lux-accent hover:border-lux-accent/30 transition-colors">
                  <Shield size={13} /> Orders
                </Link>
                <Link to="/admin/users" className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-lux-border text-lux-muted text-xs font-medium hover:text-lux-accent hover:border-lux-accent/30 transition-colors">
                  <Users size={13} /> Users
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <main>
        {/* ── HERO ─────────────────────────────────────────────────── */}
        <section className={`relative overflow-hidden bg-lux-bg ${isAdmin ? "pt-8" : "pt-24 lg:pt-28"}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 min-h-[85vh] items-center">

              {/* Left — Text Content */}
              <div className="flex flex-col justify-center space-y-7 py-12 lg:py-20 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="section-divider" />
                  <span className="section-overline">New Season Collection</span>
                </div>

                <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-lux-text">
                  Style That{" "}
                  <span className="italic text-lux-accent">Speaks You</span>
                </h1>

                <p className="text-lux-muted text-base sm:text-lg leading-relaxed max-w-md">
                  Elegant. Feminine. Effortless.<br />
                  Discover pieces that make every moment beautiful.
                </p>

                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/shop"
                    className="btn-luxury flex items-center gap-2 text-sm"
                  >
                    Shop Now <ArrowRight size={16} />
                  </Link>
                  <Link
                    to="/shop"
                    className="btn-luxury-outline flex items-center gap-2 text-sm"
                  >
                    Explore Collection
                  </Link>
                </div>

                {/* Trust micro-copy */}
                <div className="flex items-center gap-5 pt-2">
                  {[
                    { icon: Truck, text: "Free delivery" },
                    { icon: RefreshCw, text: "30-day returns" },
                    { icon: ShieldCheck, text: "Secure payment" },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-1.5 text-xs text-lux-muted">
                      <Icon size={13} className="text-lux-accent" /> {text}
                    </div>
                  ))}
                </div>

                {/* Slide indicators */}
                <div className="flex items-center gap-2 pt-2">
                  {HERO_IMAGES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentHeroIndex(i)}
                      className={`transition-all duration-300 rounded-full ${
                        currentHeroIndex === i
                          ? "w-8 h-2 bg-lux-accent"
                          : "w-2 h-2 bg-lux-border hover:bg-lux-accent/40"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Right — Cinematic Image */}
              <div className="relative flex items-center justify-center py-12 lg:py-10">
                {/* Main image frame */}
                <div className="relative w-full max-w-lg aspect-[3/4] rounded-3xl overflow-hidden shadow-warm-xl">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentHeroIndex}
                      src={HERO_IMAGES[currentHeroIndex]}
                      alt="New Collection"
                      initial={{ opacity: 0, scale: 1.06 }}
                      animate={{ opacity: 1, scale: 1.02 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full h-full object-cover object-center"
                    />
                  </AnimatePresence>
                  {/* Subtle warm overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-lux-text/20 via-transparent to-transparent" />
                </div>

                {/* Floating badge — New Collection */}
                <div className="absolute top-16 -left-4 lg:-left-8 bg-white rounded-2xl shadow-warm-md px-4 py-3 border border-lux-border animate-float">
                  <p className="text-[10px] font-semibold text-lux-accent uppercase tracking-wider">✦ New Arrival</p>
                  <p className="text-sm font-bold text-lux-text mt-0.5">Summer '25</p>
                </div>

                {/* Floating badge — Discount */}
                <div className="absolute bottom-24 -right-4 lg:-right-8 bg-lux-accent rounded-2xl shadow-warm-md px-4 py-3 text-white">
                  <p className="text-[10px] font-semibold uppercase tracking-wider opacity-80">Limited Time</p>
                  <p className="text-lg font-display font-bold">Up to 40% Off</p>
                </div>

                {/* Floating stat card */}
                <div className="absolute bottom-8 left-4 lg:-left-6 bg-white rounded-2xl shadow-warm-md px-4 py-3 border border-lux-border flex items-center gap-3">
                  <div className="flex -space-x-1.5">
                    {["P", "A", "S"].map((l) => (
                      <div key={l} className="w-7 h-7 rounded-full bg-lux-accent/10 border-2 border-white flex items-center justify-center text-[10px] font-bold text-lux-accent">
                        {l}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map((s) => <Star key={s} size={10} className="text-yellow-400 fill-yellow-400" />)}
                    </div>
                    <p className="text-[10px] text-lux-muted mt-0.5">10K+ happy customers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="border-t border-lux-border bg-white mt-4">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-lux-border">
                {stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col items-center py-6 gap-1">
                    <span className="text-2xl font-display font-bold text-lux-text">{stat.value}</span>
                    <span className="text-xs text-lux-muted uppercase tracking-wider">{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES BAR ─────────────────────────────────────────── */}
        <section className="py-12 bg-lux-bg2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {features.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="bg-white border border-lux-border rounded-2xl p-5 flex items-center gap-4 hover:border-lux-accent/30 hover:shadow-warm-sm transition-all duration-300 group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-lux-light flex items-center justify-center shrink-0 group-hover:bg-lux-accent/10 transition-colors">
                      <Icon size={20} className="text-lux-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-lux-text">{feat.title}</p>
                      <p className="text-xs text-lux-muted mt-0.5">{feat.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── FEATURED PRODUCTS ─────────────────────────────────────── */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="section-overline">Featured</span>
                <h2 className="ecom-section-title">Editor's Pick</h2>
                <div className="section-divider mt-3" />
              </div>
              <Link to="/shop" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-lux-accent hover:text-lux-hover transition-colors">
                View All <ChevronRight size={16} />
              </Link>
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
              <div className="text-center py-16 text-lux-muted">
                <Heart size={40} className="mx-auto mb-4 text-lux-border" />
                <p>No featured products available</p>
              </div>
            )}
          </div>
        </section>

        {/* ── CATEGORIES ───────────────────────────────────────────── */}
        <section className="py-16 lg:py-24 bg-lux-bg2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="section-overline">Collections</span>
              <h2 className="ecom-section-title">Shop by Category</h2>
              <div className="section-divider mx-auto mt-3" />
              <p className="text-lux-muted text-sm mt-4 max-w-md mx-auto">
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
                    className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-lux-warm border border-lux-border hover:border-lux-accent/30 hover:shadow-warm-md transition-all duration-400"
                  >
                    {cat.image?.url || cat.image ? (
                      <img
                        src={cat.image?.url || cat.image}
                        alt={cat.name}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-lux-light to-lux-warm flex items-center justify-center">
                        <span className="text-5xl font-display font-bold text-lux-accent/20">{cat.name?.charAt(0)}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-lux-text/70 via-transparent to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-base font-display font-semibold text-white group-hover:text-lux-accent/90 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-white/70 mt-1 flex items-center gap-1">
                        Explore <ArrowRight size={11} className="group-hover:translate-x-1 transition-transform" />
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-lux-muted text-sm">No categories available</div>
            )}
          </div>
        </section>

        {/* ── LUXURY BANNER ─────────────────────────────────────────── */}
        <section className="py-16 lg:py-20 bg-lux-text overflow-hidden relative">
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border-[60px] border-white" />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] font-semibold text-lux-accent uppercase tracking-[0.3em]">Exclusive Offer</span>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mt-4 mb-6 leading-tight">
                New Season.<br />
                <span className="italic text-lux-accent">New You.</span>
              </h2>
              <p className="text-white/60 text-sm leading-relaxed mb-8">
                Explore our curated summer collection — soft linens, floral prints, and timeless silhouettes crafted for the modern woman.
              </p>
              <Link to="/shop" className="btn-luxury">
                Explore Collection <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* ── TRENDING NOW ─────────────────────────────────────────── */}
        <section className="py-16 lg:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="section-overline">Trending</span>
                <h2 className="ecom-section-title">Trending Now</h2>
                <div className="section-divider mt-3" />
              </div>
              <Link to="/shop?sort=popular" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-lux-accent hover:text-lux-hover transition-colors">
                View All <ChevronRight size={16} />
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
              <div className="text-center py-12 text-lux-muted text-sm">No trending products available</div>
            )}
          </div>
        </section>

        {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
        <section className="py-16 lg:py-24 bg-lux-bg2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="section-overline">Reviews</span>
              <h2 className="ecom-section-title">What Our Customers Say</h2>
              <div className="section-divider mx-auto mt-3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.name} className="bg-white rounded-2xl border border-lux-border p-6 shadow-card hover:shadow-warm-md transition-all duration-300">
                  <div className="flex items-center gap-0.5 mb-4">
                    {[1,2,3,4,5].map((s) => <Star key={s} size={14} className="text-yellow-400 fill-yellow-400" />)}
                  </div>
                  <p className="text-sm text-lux-muted leading-relaxed mb-5 italic">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-lux-accent/10 flex items-center justify-center text-sm font-bold text-lux-accent">
                      {t.avatar}
                    </div>
                    <p className="text-sm font-semibold text-lux-text">{t.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── NEWSLETTER ───────────────────────────────────────────── */}
        <section className="py-16 lg:py-24">
          <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-lux-light flex items-center justify-center mx-auto mb-6">
              <Mail size={24} className="text-lux-accent" />
            </div>
            <h2 className="font-display text-3xl font-bold text-lux-text mb-3">Stay in the Loop</h2>
            <p className="text-lux-muted text-sm leading-relaxed mb-8">
              Subscribe for new arrivals, exclusive drops, and special offers delivered to your inbox.
            </p>
            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="luxury-input flex-1 rounded-full"
              />
              <button type="submit" className="btn-luxury whitespace-nowrap">
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
