import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaTwitter,
  FaInstagram,
  FaFacebookF,
  FaEnvelope,
  FaShieldAlt,
  FaTruck,
  FaHeadset,
} from "react-icons/fa";

function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail("");
      }, 4000);
    }
  };

  return (
    <footer className="w-full bg-white text-slate-600 font-sans border-t border-slate-200 pt-12 pb-8">
      {/* ── Main Footer Links Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-slate-100">
          {/* Column 1: Brand Info & Support */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4f46e5] to-[#6366f1] text-white flex items-center justify-center font-black text-lg shadow-sm">
                N
              </div>
              <span className="font-black text-slate-900 text-2xl tracking-tight font-['Outfit']">
                NEXORA<span className="text-[#4f46e5]">.</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Premium electronics, smart tech, and modern accessories curated for your everyday digital lifestyle.
            </p>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <FaEnvelope className="text-[#4f46e5]" size={12} />
                <span>support@nexorastore.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <FaHeadset className="text-[#4f46e5]" size={12} />
                <span>Mon – Sat: 9:00 AM – 7:00 PM</span>
              </div>
            </div>
            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-1">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#4f46e5] hover:text-white flex items-center justify-center text-slate-600 transition-colors"
              >
                <FaFacebookF size={12} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#4f46e5] hover:text-white flex items-center justify-center text-slate-600 transition-colors"
              >
                <FaInstagram size={12} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#4f46e5] hover:text-white flex items-center justify-center text-slate-600 transition-colors"
              >
                <FaTwitter size={12} />
              </a>
            </div>
          </div>

          {/* Column 2: Top Categories */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 font-['Outfit']">
              Top Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li>
                <Link to="/allproducts?category=mobile" className="hover:text-[#4f46e5] transition-colors">
                  Smartphones & Tablets
                </Link>
              </li>
              <li>
                <Link to="/allproducts?category=laptop" className="hover:text-[#4f46e5] transition-colors">
                  Laptops & PC Gaming
                </Link>
              </li>
              <li>
                <Link to="/allproducts?category=audio" className="hover:text-[#4f46e5] transition-colors">
                  Headphones & Speakers
                </Link>
              </li>
              <li>
                <Link to="/allproducts?category=watch" className="hover:text-[#4f46e5] transition-colors">
                  Smart Watches & Fitness
                </Link>
              </li>
              <li>
                <Link to="/allproducts?category=tv" className="hover:text-[#4f46e5] transition-colors">
                  4K OLED & Smart Displays
                </Link>
              </li>
              <li>
                <Link to="/allproducts?category=camera" className="hover:text-[#4f46e5] transition-colors">
                  Cameras & Drones
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Links */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 font-['Outfit']">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li>
                <Link to="/allproducts" className="hover:text-[#4f46e5] transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/allproducts?category=deals" className="hover:text-[#4f46e5] transition-colors">
                  Special Offers & Deals
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#4f46e5] transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#4f46e5] transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-[#4f46e5] transition-colors">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Customer Care */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 font-['Outfit']">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-500">
              <li>
                <Link to="/profile" className="hover:text-[#4f46e5] transition-colors">
                  Help & Support Center
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#4f46e5] transition-colors">
                  Shipping & Delivery Info
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#4f46e5] transition-colors">
                  Warranty & Returns
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#4f46e5] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#4f46e5] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Newsletter */}
          <div>
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider mb-4 font-['Outfit']">
              Newsletter
            </h4>
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              {subscribed
                ? "🎉 You are subscribed! Check your inbox for 10% off."
                : "Subscribe to receive special discounts, news, and flash sales alerts."}
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address..."
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#4f46e5]"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                Subscribe
              </button>
            </form>

            <div className="pt-3.5 flex items-center gap-2 text-slate-500 text-[11px]">
              <FaShieldAlt className="text-emerald-500 shrink-0" size={13} />
              <span>100% Secure Checkout & Verified Payments</span>
            </div>
          </div>
        </div>

        {/* ── Bottom Bar: Copyright & Trust Badges ── */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 Nexora Tech. All rights reserved.</p>
          <div className="flex items-center gap-6 text-[11px] font-medium text-slate-500">
            {/* <span className="flex items-center gap-1.5">
              <FaTruck className="text-[#4f46e5]" size={12} /> Fast Delivery
            </span>
            <span className="flex items-center gap-1.5">
              <FaShieldAlt className="text-[#4f46e5]" size={12} /> 100% Genuine Products
            </span> */}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

