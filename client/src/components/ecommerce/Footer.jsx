import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Heart,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Send,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";

const companyLinks = [
  { name: "About Us", path: "/" },
  { name: "Shop", path: "/shop" },
  { name: "Orders", path: "/orders" },
];

const helpLinks = [
  { name: "Shipping Info", path: "/" },
  { name: "Returns & Exchanges", path: "/" },
  { name: "FAQ", path: "/" },
  { name: "Contact Us", path: "/" },
];

const categoryLinks = [
  { name: "Traditional Wear", slug: "traditional" },
  { name: "Contemporary", slug: "contemporary" },
  { name: "Accessories", slug: "accessories" },
  { name: "Festive Collection", slug: "festive" },
  { name: "New Arrivals", slug: "new-arrivals" },
];

const socialLinks = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "Youtube" },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success("Subscribed to newsletter!");
      setEmail("");
    }
  };

  return (
    <footer className="bg-surface-900 border-t border-surface-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 py-14 lg:py-16">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/ecommerce" className="inline-block group">
              <h2 className="text-xl font-bold tracking-[0.25em] text-accent">
                SAAJSAKHEE
              </h2>
            </Link>
            <p className="mt-4 text-sm text-text-muted leading-relaxed">
              Curating the finest in traditional and contemporary fashion. Every
              piece tells a story of craftsmanship and elegance.
            </p>
            <div className="mt-5 space-y-2.5">
              <a
                href="mailto:hello@saajsakhee.com"
                className="flex items-center gap-2.5 text-sm text-text-muted hover:text-accent transition-colors"
              >
                <Mail size={14} />
                hello@saajsakhee.com
              </a>
              <a
                href="tel:+1234567890"
                className="flex items-center gap-2.5 text-sm text-text-muted hover:text-accent transition-colors"
              >
                <Phone size={14} />
                +1 (234) 567-890
              </a>
              <div className="flex items-start gap-2.5 text-sm text-text-muted">
                <MapPin size={14} className="mt-0.5 shrink-0" />
                <span>123 Fashion Street, Design District, NY 10001</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-text-muted hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              Help
            </h3>
            <ul className="space-y-3">
              {helpLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="text-sm text-text-muted hover:text-accent transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop Categories */}
          <div>
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              Shop
            </h3>
            <ul className="space-y-3">
              {categoryLinks.map((cat) => (
                <li key={cat.slug}>
                    <Link
                      to={`/shop?category=${cat.slug}`}
                    className="text-sm text-text-muted hover:text-accent transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              Follow Us
            </h3>
            <div className="flex items-center gap-3 mb-6">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-surface-700 text-text-muted hover:bg-accent hover:text-white transition-all duration-200"
                  >
                    <Icon size={16} />
                  </a>
                );
              })}
            </div>

            <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-3">
              Newsletter
            </h3>
            <p className="text-xs text-text-muted mb-3 leading-relaxed">
              Subscribe for exclusive offers, new arrivals, and behind-the-scenes
              stories.
            </p>
            <form onSubmit={handleNewsletter} className="flex">
              <div className="relative flex-1">
                <Mail
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email"
                  required
                  className="w-full bg-surface-800 border border-surface-600 rounded-l-lg pl-9 pr-3 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                />
              </div>
              <button
                type="submit"
                className="bg-accent hover:bg-accent/90 text-white px-4 rounded-r-lg flex items-center justify-center transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-surface-700/50 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} SAAJSAKHEE. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <span className="text-xs text-text-muted">
              Privacy Policy
            </span>
            <span className="text-xs text-text-muted">
              Terms of Service
            </span>
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <span>Made with</span>
              <Heart size={12} className="text-danger" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
