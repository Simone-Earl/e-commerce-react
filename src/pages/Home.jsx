import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, 'products'), limit(8));
        const querySnapshot = await getDocs(q);
        const productsArray = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setFeaturedProducts(productsArray);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const handleAddToCart = (e, product) => {
    e.preventDefault(); 
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <>
      {/* --- HERO SECTION --- */}
      <section className="relative bg-white overflow-hidden border-b border-gray-100">
        {/* Decorative Background blob */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-brand-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32 flex flex-col md:flex-row items-center relative z-10">
          
          {/* Text Content */}
          <motion.div 
            initial="hidden" animate="show" transition={{ staggerChildren: 0.2 }}
            className="md:w-1/2 md:pr-12 text-center md:text-left mb-12 md:mb-0"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold uppercase tracking-wider mb-6 border border-brand-100">
              <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse"></span>
              New Spring Collection 2026
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
              Elevate Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-teal-500">Workspace Style</span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg text-slate-600 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed">
              Discover the latest trends in mechanical keyboards, premium audio, and desk accessories. Shop our curated collection and redefine your workflow today.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
              <Link to="/products" className="w-full sm:w-auto bg-brand-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/30 transition-all duration-300 flex items-center justify-center gap-2">
                Shop Now 
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
              <Link to="/products" className="w-full sm:w-auto bg-white text-slate-700 border-2 border-gray-200 px-8 py-4 rounded-xl font-bold hover:bg-gray-50 hover:border-brand-600 hover:text-brand-600 transition-all duration-300 text-center">
                Explore Collections
              </Link>
            </motion.div>
            
            {/* Trust badges */}
            <motion.div variants={fadeUp} className="mt-10 pt-8 border-t border-gray-100 flex items-center justify-center md:justify-start gap-8 opacity-60">
              <div className="text-xl font-bold font-serif tracking-widest">WIRED</div>
              <div className="text-xl font-bold font-serif tracking-widest">TheVerge</div>
              <div className="text-xl font-bold font-serif tracking-widest">Forbes</div>
            </motion.div>
          </motion.div>
          
          {/* Hero Image */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}
            className="md:w-1/2 w-full"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-gray-200/50 group">
              <img 
                src="https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&q=80&w=1200" 
                alt="Tech Workspace" 
                className="w-full h-[400px] md:h-[600px] object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out" 
              />
              
              {/* Overlay floating card */}
              <div className="absolute bottom-6 left-6 right-6 md:left-auto md:-left-12 md:bottom-12 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-4 animate-[bounce_3s_infinite]">
                <img src="https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&q=80&w=100" className="w-16 h-16 rounded-xl object-cover" alt="Keyboard" />
                <div>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Trending Now</p>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">Mechanical Keyboard</p>
                  <p className="text-brand-600 font-extrabold mt-1">$120.00</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FEATURED PRODUCTS SECTION --- */}
      <section className="py-20 bg-themebg/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">Featured Products</h2>
              <p className="text-slate-500 max-w-2xl text-lg">Handpicked essentials designed to elevate your everyday experience. Quality craftsmanship meets modern design.</p>
            </div>
            <Link to="/products" className="mt-4 md:mt-0 text-brand-600 font-bold hover:text-brand-700 group flex items-center gap-2 whitespace-nowrap">
              View All Products 
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600"></div></div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
                {featuredProducts.map((product) => (
                  <div key={product.id} className="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-xl hover:border-brand-200 transition-all duration-300 flex flex-col relative">
                    
                    {/* Status Badges */}
                    {product.stockCount > 0 && product.stockCount <= 5 && (
                      <div className="absolute top-6 left-6 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wide">
                        Low Stock
                      </div>
                    )}
                    
                    {/* Image Area */}
                    <Link to="/products" className="relative overflow-hidden rounded-xl mb-4 aspect-[4/5] bg-gray-50 cursor-pointer block">
                      <img src={product.image} alt={product.name} className="object-cover w-full h-full mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                      
                      {/* Quick view overlay */}
                      <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold hover:bg-brand-600 hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-lg">
                          Quick View
                        </button>
                      </div>
                    </Link>
                    
                    {/* Details Area */}
                    <div className="mb-1 text-xs text-slate-400 uppercase tracking-wide font-bold">{product.category || 'Gear'}</div>
                    <Link to="/products">
                      <h3 className="font-bold text-slate-900 mb-2 cursor-pointer hover:text-brand-600 transition-colors line-clamp-1">{product.name}</h3>
                    </Link>
                    
                    {/* UI Star Rating (Decorative) */}
                    <div className="flex items-center gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-3 h-3 ${i < 4 ? 'text-amber-400' : 'text-gray-300'}`} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                        </svg>
                      ))}
                      <span className="text-xs text-slate-400 ml-1 font-bold">(42)</span>
                    </div>
                    
                    {/* Footer Row */}
                    <div className="mt-auto flex items-center justify-between">
                      <span className="font-extrabold text-xl text-slate-900">${product.price}</span>
                      <button 
                        onClick={(e) => handleAddToCart(e, product)}
                        disabled={product.stockCount === 0}
                        className="bg-slate-900 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-brand-600 transition-colors shadow-md active:scale-95 disabled:bg-gray-200 disabled:cursor-not-allowed"
                      >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Load More Button */}
              <div className="mt-12 text-center">
                <Link to="/products" className="inline-flex items-center justify-center px-8 py-3.5 border-2 border-gray-200 rounded-full text-slate-700 bg-white hover:border-brand-600 hover:text-brand-600 font-bold transition-colors gap-2">
                  Load More Products 
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}