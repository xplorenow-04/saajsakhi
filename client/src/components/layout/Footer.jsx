import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { IoLogoInstagram, IoLogoTwitter, IoLogoYoutube, IoLogoFacebook } from 'react-icons/io5';
import { useState } from 'react';
import toast from 'react-hot-toast';

const footerLinks = {
  shop: [
    { name: 'Men', path: '/shop?category=Men' },
    { name: 'Women', path: '/shop?category=Women' },
    { name: 'New Arrivals', path: '/shop?sort=newest' },
    { name: 'Sale', path: '/shop?discount=true' },
  ],
  support: [
    { name: 'Contact Us', path: '#' },
    { name: 'Shipping & Returns', path: '#' },
    { name: 'Size Guide', path: '#' },
    { name: 'FAQ', path: '#' },
  ],
  company: [
    { name: 'About Us', path: '#' },
    { name: 'Careers', path: '#' },
    { name: 'Privacy Policy', path: '#' },
    { name: 'Terms of Service', path: '#' },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      toast.success('Subscribed successfully!');
      setEmail('');
    }
  };

  return (
    <footer className="border-t border-border">
      {/* Newsletter */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-display italic mb-4"
            >
              Join the <span className="accent-gradient-text">SAAJSAKHI</span> Community
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-secondary mb-8"
            >
              Subscribe to get early access to new arrivals, exclusive offers, and style inspiration.
            </motion.p>
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              onSubmit={handleSubscribe}
              className="flex gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="flex-1 bg-surface2 border border-border rounded-full px-5 py-3 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-accent transition-all"
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-6 py-3 rounded-full accent-gradient text-white text-sm font-medium hover:shadow-lg hover:shadow-accent/25 transition-all"
              >
                Subscribe
              </motion.button>
            </motion.form>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-xl font-display italic font-bold">
              SAAJ<span className="accent-gradient-text">SAKHI</span>
            </Link>
            <p className="text-sm text-secondary mt-4 leading-relaxed">
              Premium fashion for the modern individual. Curated collections that define style.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[IoLogoInstagram, IoLogoTwitter, IoLogoYoutube, IoLogoFacebook].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="#"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 rounded-full bg-surface2 border border-border flex items-center justify-center text-secondary hover:text-primary hover:border-accent transition-all"
                >
                  <Icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-sm text-secondary hover:text-primary transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map(link => (
                <li key={link.name}>
                  <a href={link.path} className="text-sm text-secondary hover:text-primary transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map(link => (
                <li key={link.name}>
                  <a href={link.path} className="text-sm text-secondary hover:text-primary transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 pt-8 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Phone</p>
            <p className="text-sm">+91 9022565195</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Email</p>
            <p className="text-sm">hello@saajsakhi.com</p>
          </div>
          <div>
            <p className="text-xs text-muted uppercase tracking-wider mb-1">Location</p>
            <p className="text-sm">India</p>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} SAAJSAKHI. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-muted hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="text-xs text-muted hover:text-primary transition-colors">Terms</a>
            <a href="#" className="text-xs text-muted hover:text-primary transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
