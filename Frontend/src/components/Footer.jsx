import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaGithub,
  FaTwitter,
  FaInstagram,
  FaFacebookF,
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaCcAmex,
  FaApplePay,
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
    <footer className="w-full bg-white text-slate-600 font-sans border-t border-slate-200 py-12">
      {/* ── Main Footer Links Grid ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1: Brand Info & Contact */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#4f46e5] to-[#6366f1] text-white flex items-center justify-center font-black text-lg shadow-sm">
                T
              </div>
              <span className="font-black text-slate-900 text-2xl tracking-tight font-['Outfit']">
                TREO<span className="text-[#4f46e5]">.</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your one-stop destination for cutting-edge electronics, premium smart home tech, and everyday luxury gadgets.
            </p>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <FaPhoneAlt className="text-[#4f46e5]" size={12} />
                <span className="font-bold text-slate-800">+1 (800) 123-4567</span>
              </div>
              <div className="flex items-center gap-2.5">
                <FaEnvelope className="text-[#4f46e5]" size={12} />
                <span>support@treotech.com</span>
              </div>
              <div className="flex items-center gap-2.5">
                <FaMapMarkerAlt className="text-[#4f46e5]" size={12} />
                <span>5th Avenue, New York, NY 10001</span>
              </div>
            </div>
            {/* Social Icons */}
            <div className="flex items-center gap-2.5 pt-2">
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
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-[#4f46e5] hover:text-white flex items-center justify-center text-slate-600 transition-colors"
              >
                <FaGithub size={12} />
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
                <Link to="/allproducts?category=audio" className="hover:text-[#4f46e5] transition-colors">
                  Best Selling Tech
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
                  90-Day Returns Policy
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#4f46e5] transition-colors">
                  Warranty Coverage
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#4f46e5] transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#4f46e5] transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Newsletter & App */}
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

            <div className="pt-4 mt-2">
              <p className="text-[10px] font-extrabold uppercase text-slate-400 mb-2">
                Guaranteed Safe Checkout
              </p>
              <div className="flex items-center gap-2 text-2xl text-slate-400">
                <FaCcVisa title="Visa" className="hover:text-blue-600 transition-colors" />
                <FaCcMastercard title="Mastercard" className="hover:text-red-500 transition-colors" />
                <FaCcPaypal title="PayPal" className="hover:text-blue-500 transition-colors" />
                <FaCcAmex title="American Express" className="hover:text-blue-700 transition-colors" />
                <FaApplePay title="Apple Pay" className="hover:text-slate-900 transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

