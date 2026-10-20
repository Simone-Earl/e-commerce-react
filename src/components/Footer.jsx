import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* Brand Info */}
          <div className="lg:col-span-4">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-brand-600 text-white p-2.5 rounded-xl shadow-sm">
                <span className="text-white text-xl font-bold leading-none">T</span>
              </div>
              <span className="font-extrabold text-2xl tracking-tight text-white">TECH<span className="text-brand-500">STORE</span></span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed mb-8 pr-4">
              Your premium destination for carefully curated tech, electronics, and workspace products. We blend quality with modern aesthetics to bring you the best.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865l8.873 11.633Z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8.049c0-4.446-3.582-8.05-8-8.05C3.58 0-.002 3.603-.002 8.05c0 4.017 2.926 7.347 6.75 7.951v-5.625h-2.03V8.05H6.75V6.275c0-2.017 1.195-3.131 3.022-3.131.876 0 1.791.157 1.791.157v1.98h-1.009c-.993 0-1.303.621-1.303 1.258v1.51h2.218l-.354 2.326H9.25V16c3.824-.604 6.75-3.934 6.75-7.951z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-brand-600 hover:text-white transition-colors duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/></svg>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold text-lg mb-6">Quick Links</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/" className="text-slate-400 hover:text-brand-400 transition-colors flex items-center gap-2">› Home</Link></li>
              <li><Link to="/products" className="text-slate-400 hover:text-brand-400 transition-colors flex items-center gap-2">› Shop Catalog</Link></li>
              <li><Link to="/cart" className="text-slate-400 hover:text-brand-400 transition-colors flex items-center gap-2">› Your Cart</Link></li>
              <li><Link to="/profile" className="text-slate-400 hover:text-brand-400 transition-colors flex items-center gap-2">› Profile</Link></li>
            </ul>
          </div>
          
          {/* Support */}
          <div className="lg:col-span-2">
            <h4 className="text-white font-bold text-lg mb-6">Support</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="text-slate-400 hover:text-brand-400 transition-colors flex items-center gap-2">› Shipping Policy</a></li>
              <li><a href="#" className="text-slate-400 hover:text-brand-400 transition-colors flex items-center gap-2">› Returns & Refunds</a></li>
              <li><a href="#" className="text-slate-400 hover:text-brand-400 transition-colors flex items-center gap-2">› FAQ</a></li>
              <li><a href="#" className="text-slate-400 hover:text-brand-400 transition-colors flex items-center gap-2">› Track Order</a></li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div className="lg:col-span-4">
            <h4 className="text-white font-bold text-lg mb-6">Stay in the loop</h4>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">Subscribe to our newsletter to receive updates on new arrivals, exclusive discounts, and fashion inspiration.</p>
            <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
              <div className="relative flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <input type="email" placeholder="Enter your email address" className="bg-slate-800 border border-slate-700 text-white text-sm rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 w-full transition-all" />
              </div>
              <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-brand-600/20 whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
        
        {/* Bottom Footer */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} TechStore Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-500 font-extrabold text-sm tracking-wider">
            <span className="hover:text-white transition-colors cursor-pointer">VISA</span>
            <span className="hover:text-white transition-colors cursor-pointer">MASTERCARD</span>
            <span className="hover:text-white transition-colors cursor-pointer">PAYPAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}