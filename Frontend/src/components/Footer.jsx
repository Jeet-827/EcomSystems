import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FaGithub, 
  FaTwitter, 
  FaInstagram, 
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
    <footer className="w-full bg-[#0d0d0d] text-slate-300 font-sans border-t border-white/10 transition-colors pt-12 pb-8">
      {/* Main Footer Links Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 border-b border-white/10 pb-12">
          
          {/* Column 1: ABOUT */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
              ABOUT
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Our Story</Link></li>
              <li><Link to="/allproducts" className="hover:text-emerald-400 transition-colors">Design Philosophy</Link></li>
              <li><Link to="/allproducts" className="hover:text-emerald-400 transition-colors">Craftsmanship</Link></li>
              <li><Link to="/allproducts" className="hover:text-emerald-400 transition-colors">Press & Media</Link></li>
            </ul>
          </div>

          {/* Column 2: HELP */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
              HELP
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/profile" className="hover:text-emerald-400 transition-colors">Customer Care</Link></li>
              <li><Link to="/profile" className="hover:text-emerald-400 transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/profile" className="hover:text-emerald-400 transition-colors">Warranty & Service</Link></li>
              <li><Link to="/profile" className="hover:text-emerald-400 transition-colors">Product Manuals</Link></li>
            </ul>
          </div>

          {/* Column 3: LOGISTICS */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
              LOGISTICS
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li><Link to="/cart" className="hover:text-emerald-400 transition-colors">Global Express</Link></li>
              <li><Link to="/cart" className="hover:text-emerald-400 transition-colors">Track Order</Link></li>
              <li><Link to="/cart" className="hover:text-emerald-400 transition-colors">White Glove Delivery</Link></li>
            </ul>
          </div>

          {/* Column 4: NEWSLETTER */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
              NEWSLETTER
            </h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              {subscribed ? "Thank you for subscribing!" : "Subscribe for exclusive AURA product releases."}
            </p>
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address..."
                required
                className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button type="submit" className="px-3 py-2 btn-emerald-lux text-xs cursor-pointer">
                JOIN
              </button>
            </form>
          </div>

          {/* Column 5: SOCIALS */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">
              SOCIALS
            </h4>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors">
                <FaInstagram size={14} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors">
                <FaTwitter size={14} />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="w-8 h-8 rounded-full bg-[#1a1a1a] border border-white/10 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors">
                <FaGithub size={14} />
              </a>
            </div>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 AURA x Bang & Olufsen Collection. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
