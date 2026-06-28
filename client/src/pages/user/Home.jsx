import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import { IoStar, IoShieldCheckmark, IoRocket, IoLockClosed, IoReturnDownBack, IoArrowForward, IoBagOutline } from 'react-icons/io5';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useShopStore } from '../../store/shopStore';
import { SectionHeader, ProductCard, Button } from '../../components/ui';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

gsap.registerPlugin(ScrollTrigger);

const categories = [
  { name: 'Men', image: 'https://images.unsplash.com/photo-1617137968427-85924d1c5360?w=600&q=80', count: '124 Products' },
  { name: 'Women', image: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600&q=80', count: '156 Products' },
  { name: 'Oversized', image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&q=80', count: '89 Products' },
  { name: 'Streetwear', image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=600&q=80', count: '67 Products' },
  { name: 'Accessories', image: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=600&q=80', count: '45 Products' },
  { name: 'Shoes', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&q=80', count: '34 Products' },
];

const features = [
  { icon: IoShieldCheckmark, title: 'Premium Quality', desc: 'Handpicked fabrics and materials for lasting comfort and style.' },
  { icon: IoRocket, title: 'Fast Delivery', desc: 'Free shipping on orders above Rs.999. Delivered within 3-5 business days.' },
  { icon: IoLockClosed, title: 'Secure Shopping', desc: '100% secure checkout with encrypted payment gateways.' },
  { icon: IoReturnDownBack, title: 'Easy Returns', desc: '30-day hassle-free return policy. No questions asked.' },
];

const testimonials = [
  { name: 'Priya S.', role: 'Fashion Enthusiast', text: 'The quality exceeded my expectations. The fabric is incredibly soft and the fit is perfect.', rating: 5, avatar: 'https://i.pravatar.cc/100?img=1' },
  { name: 'Rahul M.', role: 'Regular Customer', text: 'My go-to store for streetwear. The oversized collection is absolutely fire!', rating: 5, avatar: 'https://i.pravatar.cc/100?img=3' },
  { name: 'Ananya K.', role: 'Style Blogger', text: 'SAAJSAKHI has completely transformed my wardrobe. Such elegant designs at affordable prices.', rating: 5, avatar: 'https://i.pravatar.cc/100?img=5' },
  { name: 'Arjun D.', role: 'Fitness Coach', text: 'Love the athleisure collection. Perfect for both gym and casual outings.', rating: 4, avatar: 'https://i.pravatar.cc/100?img=8' },
  { name: 'Neha G.', role: 'College Student', text: 'Best streetwear brand in India. The discounts are amazing and quality is top-notch!', rating: 5, avatar: 'https://i.pravatar.cc/100?img=9' },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function Home() {
  const navigate = useNavigate();
  const { featuredProducts, fetchFeaturedProducts } = useShopStore();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.animate-on-scroll', {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '.animate-trigger',
          start: 'top 80%',
        },
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className="overflow-hidden">
      <section ref={heroRef} className="relative h-screen min-h-[600px] flex items-center justify-center overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/70 z-10" />
          <img
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1920&q=85"
            alt="Fashion"
            className="w-full h-full object-cover"
          />
        </motion.div>
        <motion.div style={{ opacity: heroOpacity }} className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-accent-light text-sm md:text-base uppercase tracking-[0.2em] mb-6"
          >
            New Collection 2026
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-display italic text-white leading-[1.1] mb-8"
          >
            Define Your
            <br />
            <span className="accent-gradient-text">Style Story</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-white/70 text-lg max-w-2xl mx-auto mb-10"
          >
            Discover curated fashion that speaks your language. From timeless classics to bold streetwear.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="flex items-center justify-center gap-4 flex-wrap"
          >
            <Button size="lg" className="accent-gradient text-white border-0" onClick={() => navigate('/shop')}>
              Shop Now
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-white border-white/30 hover:bg-white/10"
              onClick={() => navigate('/shop')}
            >
              Explore Collection
            </Button>
          </motion.div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="flex flex-col items-center gap-2 text-white/50">
            <span className="text-xs uppercase tracking-widest">Scroll</span>
            <div className="w-5 h-8 rounded-full border border-white/30 flex items-start justify-center p-1.5">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1 h-2 rounded-full accent-gradient"
              />
            </div>
          </div>
        </motion.div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <SectionHeader title="Shop by Category" subtitle="Find your perfect style from our curated collections" />
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.name}
              variants={staggerItem}
              whileHover={{ y: -8 }}
              className="group cursor-pointer"
              onClick={() => navigate(`/shop?category=${cat.name}`)}
            >
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-surface2 mb-3">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-semibold text-sm">{cat.name}</h3>
                  <p className="text-white/60 text-xs">{cat.count}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="py-24 bg-surface2/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="New Arrivals" subtitle="Fresh drops to elevate your wardrobe" />
          {featuredProducts.length > 0 ? (
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              breakpoints={{
                640: { slidesPerView: 2 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
              }}
              className="pb-14"
            >
              {featuredProducts.map((product, i) => (
                <SwiperSlide key={product._id}>
                  <ProductCard product={product} index={i} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-surface2 animate-pulse" />
              ))}
            </div>
          )}
          <div className="text-center mt-10">
            <Button variant="outline" onClick={() => navigate('/shop')}>
              View All
            </Button>
          </div>
        </div>
      </section>

      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60 z-10" />
          <img
            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1920&q=85"
            alt="Featured Collection"
            className="w-full h-full object-cover"
          />
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="max-w-xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-accent-light text-sm uppercase tracking-[0.2em] mb-4"
            >
              Limited Edition
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-display italic text-white leading-[1.1] mb-6"
            >
              The Summer
              <br />
              <span className="accent-gradient-text">Essentials</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-white/70 text-lg mb-8 max-w-md"
            >
              Lightweight fabrics, breathable designs, and effortless style for the season ahead.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <Button size="lg" className="accent-gradient text-white border-0" onClick={() => navigate('/shop')}>
                Explore Collection
                <IoArrowForward className="ml-2" />
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="Best Sellers" subtitle="Most loved products by our community" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {featuredProducts.slice(0, 8).map((product, i) => (
            <ProductCard key={product._id} product={product} index={i} />
          ))}
        </div>
      </section>

      <section className="py-24 bg-surface2/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader title="Why Choose Us" subtitle="We're committed to delivering the best shopping experience" />
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={staggerItem}
                className="group p-8 rounded-2xl border border-border hover:border-accent/30 bg-surface hover:shadow-lg hover:shadow-accent/5 transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-5 group-hover:accent-gradient group-hover:scale-110 transition-all duration-500">
                  <f.icon size={24} className="text-accent group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-secondary text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader title="What Our Customers Say" subtitle="Real reviews from real people" />
        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={24}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          className="pb-14"
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={i}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl border border-border bg-surface h-full"
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <IoStar key={j} size={16} className="text-warning" />
                  ))}
                </div>
                <p className="text-secondary leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-3xl md:text-5xl font-display italic mb-6">
            Ready to Elevate Your <span className="accent-gradient-text">Style</span>?
          </h2>
          <p className="text-secondary text-lg mb-8 max-w-xl mx-auto">
            Join thousands of fashion-forward individuals who trust SAAJSAKHI for their wardrobe.
          </p>
          <Button size="lg" className="accent-gradient text-white border-0" onClick={() => navigate('/shop')}>
            Start Shopping
            <IoBagOutline className="ml-2" />
          </Button>
        </motion.div>
      </section>
    </div>
  );
}
