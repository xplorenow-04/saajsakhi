import React from "react";
import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="bg-gray-950 border-t border-gray-800 text-gray-400 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="md:col-span-2">
                        <Link to="/" className="text-xl font-black tracking-widest text-white">
                            SAAJ SAKHI
                        </Link>
                        <p className="mt-4 text-sm max-w-sm text-gray-500">
                            Discover timeless elegance with our handpicked ethnic couture. Exquisite sarees, designer lehengas, and daily wear tailored for elegance and grandeur.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Shop Collections</h3>
                        <ul className="space-y-2 text-sm">
                            <li><Link to="/shop?category=Saree" className="hover:text-amber-400 transition-colors">Sarees</Link></li>
                            <li><Link to="/shop?category=Lehenga" className="hover:text-amber-400 transition-colors">Lehengas</Link></li>
                            <li><Link to="/shop?category=Kurtis" className="hover:text-amber-400 transition-colors">Kurtis & Suits</Link></li>
                            <li><Link to="/shop?discount=true" className="hover:text-amber-400 transition-colors">Exclusive Offers</Link></li>
                        </ul>
                    </div>

                    {/* Customer Service */}
                    <div>
                        <h3 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Customer Care</h3>
                        <p className="text-sm text-gray-500 mb-2">
                            Need help? Reach out to us directly on WhatsApp to finalize bookings, customize sizing, or coordinate fast delivery.
                        </p>
                        <a
                            href="https://wa.me/9172346386"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-xs font-bold bg-emerald-600/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-600/20 px-3.5 py-1.5 rounded-lg transition-colors"
                        >
                            WhatsApp Helpdesk
                        </a>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-900 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-600">
                    <p>© {new Date().getFullYear()} Saaj Sakhi. All rights reserved.</p>
                    <p className="mt-2 sm:mt-0">Crafted with love for timeless ethnic elegance.</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;
