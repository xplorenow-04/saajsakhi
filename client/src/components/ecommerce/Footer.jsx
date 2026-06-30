import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, MapPin, Heart, Instagram, Send, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { productApi } from "../../api/product.api";

const companyLinks = [
  { name: "About Us", path: "/" },
  { name: "Shop", path: "/shop" },
  { name: "My Orders", path: "/orders" },
  { name: "My Profile", path: "/profile" },
];

const helpLinks = [
  { name: "Shipping Info", path: "/" },
  { name: "Returns & Exchanges", path: "/" },
  { name: "Size Guide", path: "/" },
  { name: "FAQ", path: "/" },
  { name: "Contact Us", path: "/" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [categoryLinks, setCategoryLinks] = useState([]);

  useEffect(() => {
    productApi.getCategories().then((res) => {
      if (res.success) setCategoryLinks(res.data || []);
    });
  }, []);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success("Welcome! You're now subscribed.");
      setEmail("");
    }
  };

  return (
    <footer className="bg-lux-text text-white">
      {/* Newsletter strip */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl lg:text-3xl font-display font-bold text-white mb-2">
                Stay in Style
              </h2>
              <p className="text-white/60 text-sm max-w-md">
                Subscribe to our newsletter for exclusive drops, styling tips, and early access to new collections.
              </p>
            </div>
            <form onSubmit={handleNewsletter} className="flex gap-2 w-full max-w-md">
              <div className="relative flex-1">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full bg-white/10 border border-white/15 rounded-full pl-10 pr-4 py-3.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-lux-accent focus:bg-white/15 transition-all"
                />
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3.5 bg-lux-accent hover:bg-lux-hover text-white text-sm font-semibold rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-warm-sm active:scale-[0.98] whitespace-nowrap"
              >
                Subscribe <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2 space-y-5">
            <div>
              <h3 className="text-2xl font-display font-bold tracking-[0.15em] text-white">SAAJSAKHEE</h3>
              <p className="text-[10px] tracking-[0.3em] uppercase text-white/40 font-medium mt-0.5">Women's Fashion</p>
            </div>
            <p className="text-sm text-white/55 leading-relaxed max-w-xs">
              Crafting timeless pieces for the modern woman. Where elegance meets everyday comfort in every stitch and style.
            </p>
            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-sm text-white/50">
                <Mail size={14} className="text-lux-accent" />
                <span>hello@saajsakhee.in</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/50">
                <Phone size={14} className="text-lux-accent" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/50">
                <MapPin size={14} className="text-lux-accent" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
            {/* Social */}
            <div className="flex items-center gap-3 pt-2">
              {[
                { icon: Instagram, label: "Instagram" },
              ].map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-lux-accent flex items-center justify-center transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop column */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-lux-accent mb-5">Shop</h4>
            <ul className="space-y-3">
              {categoryLinks.slice(0, 6).map((cat) => (
                <li key={cat._id || cat.slug}>
                  <Link
                    to={`/shop?category=${cat.slug}`}
                    className="text-sm text-white/55 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-3 group-hover:ml-0" />
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-lux-accent mb-5">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/55 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-3 group-hover:ml-0" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help column */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-lux-accent mb-5">Help</h4>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/55 hover:text-white transition-colors flex items-center gap-1.5 group"
                  >
                    <ArrowRight size={11} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-3 group-hover:ml-0" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/35">
            © {new Date().getFullYear()} Saajsakhee. All rights reserved.
          </p>
          <p className="text-xs text-white/35 flex items-center gap-1.5">
            Made with <Heart size={11} className="text-lux-accent fill-lux-accent" /> for modern women
          </p>
        </div>
      </div>
    </footer>
  );
}
