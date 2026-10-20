import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const MOCK_PRODUCTS = [
  { name: 'Mechanical Keyboard', price: 120, image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=500&q=80', stockCount: 10, category: 'Peripherals' },
  { name: 'Wireless Pro Mouse', price: 50, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=500&q=80', stockCount: 15, category: 'Peripherals' },
  { name: 'Noise-Cancelling Headphones', price: 200, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80', stockCount: 4, category: 'Audio' },
  { name: '27" 4K Monitor', price: 350, image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=500&q=80', stockCount: 5, category: 'Displays' },
  { name: 'Ergonomic Desk Chair', price: 299, image: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=500&q=80', stockCount: 8, category: 'Furniture' },
  { name: 'USB-C Docking Station', price: 85, image: 'https://images.unsplash.com/photo-1616410011236-7a42121dd981?auto=format&fit=crop&w=500&q=80', stockCount: 20, category: 'Accessories' },
  { name: 'Ultra-Wide Desk Mat', price: 30, image: 'https://images.unsplash.com/photo-1615663245857-ac1eeb536fcb?auto=format&fit=crop&w=500&q=80', stockCount: 50, category: 'Accessories' },
  { name: 'Smart LED Desk Lamp', price: 65, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=500&q=80', stockCount: 12, category: 'Accessories' },
  { name: 'Studio Condenser Mic', price: 150, image: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=500&q=80', stockCount: 6, category: 'Audio' },
  { name: 'Aluminum Laptop Stand', price: 45, image: 'https://images.unsplash.com/photo-1527814050087-17933a3982e5?auto=format&fit=crop&w=500&q=80', stockCount: 25, category: 'Accessories' },
  { name: 'Motorized Standing Desk', price: 499, image: 'https://images.unsplash.com/photo-1595511890410-3b8bc2375262?auto=format&fit=crop&w=500&q=80', stockCount: 3, category: 'Furniture' },
  { name: 'Portable Bluetooth Speaker', price: 89, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=500&q=80', stockCount: 18, category: 'Audio' },
  { name: '1TB External NVMe SSD', price: 130, image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=500&q=80', stockCount: 0, category: 'Storage' },
  { name: 'Wireless Charging Pad', price: 35, image: 'https://images.unsplash.com/photo-1622445272461-c6580cab8755?auto=format&fit=crop&w=500&q=80', stockCount: 40, category: 'Accessories' },
  { name: '4K Streaming Webcam', price: 199, image: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=500&q=80', stockCount: 7, category: 'Peripherals' },
  { name: 'Dual Monitor Arm', price: 110, image: 'https://images.unsplash.com/photo-1542393545-10f5cde2c810?auto=format&fit=crop&w=500&q=80', stockCount: 14, category: 'Accessories' }
];

const SORT_OPTIONS = [
  { id: 'default', label: 'Best Selling' },
  { id: 'newest', label: 'Newest Arrivals' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' }
];

export default function Products() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter & UI States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  // Sidebar Dropdown States
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);
  const [isPriceRangeOpen, setIsPriceRangeOpen] = useState(true);
  
  const [sortOption, setSortOption] = useState('default');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const fetchProducts = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsArray = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsArray);
    } catch (error) {
      console.error("Error fetching products: ", error);
      toast.error("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "products"));
        const productsArray = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsArray);
      } catch (error) {
        console.error("Error fetching products: ", error);
        toast.error("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const seedDatabase = async () => {
    const seedToast = toast.loading('Uploading premium products to Firebase...');
    try {
      for (const product of MOCK_PRODUCTS) {
        await addDoc(collection(db, "products"), product);
      }
      await fetchProducts();
      toast.success('Database seeded successfully!', { id: seedToast });
    } catch (error) {
      console.error("Error seeding database: ", error);
      toast.error('Failed to seed database', { id: seedToast });
    }
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setCurrentPage(1);
  };

  // 1. Filter Logic
  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
  
  let filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const min = minPrice === '' ? 0 : Number(minPrice);
    const max = maxPrice === '' ? Infinity : Number(maxPrice);
    const matchesPrice = p.price >= min && p.price <= max;

    return matchesCategory && matchesSearch && matchesPrice;
  });

  // 2. Sort Logic
  if (sortOption === 'price-asc') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortOption === 'price-desc') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortOption === 'name-asc') {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  // 3. Pagination Logic
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalProducts);
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const activeSortLabel = SORT_OPTIONS.find(opt => opt.id === sortOption)?.label;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex text-sm text-slate-500 mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/" className="inline-flex items-center hover:text-brand-600 transition-colors">
              Home
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-3 h-3 mx-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <span className="text-slate-900 font-medium">All Products</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Layout: Sidebar + Grid */}
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Mobile Filter Backdrop */}
        <AnimatePresence>
          {isMobileFilterOpen && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
            />
          )}
        </AnimatePresence>
        
        {/* Left Sidebar (Filters) */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 lg:relative lg:translate-x-0 lg:w-1/4 lg:bg-transparent lg:shadow-none lg:block lg:z-0 overflow-y-auto lg:overflow-visible p-6 lg:p-0 h-full lg:h-auto ${isMobileFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          
          <div className="flex justify-between items-center mb-6 lg:hidden">
            <h2 className="text-xl font-bold text-slate-900">Filters</h2>
            <button onClick={() => setIsMobileFilterOpen(false)} className="text-slate-500 hover:text-red-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="space-y-8">
            {/* Categories */}
            <div>
              <button 
                onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                className="w-full flex items-center justify-between font-bold text-slate-900 mb-4 focus:outline-none"
              >
                <span>Categories</span>
                <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isCategoriesOpen ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
              </button>
              
              {isCategoriesOpen && (
                <ul className="space-y-3 text-sm text-slate-600">
                  {categories.map(category => {
                    const count = category === 'All' 
                      ? products.length 
                      : products.filter(p => p.category === category).length;
                    const isActive = selectedCategory === category;

                    return (
                      <li key={category}>
                        <button 
                          onClick={() => {
                            setSelectedCategory(category);
                            setCurrentPage(1);
                            setIsMobileFilterOpen(false);
                          }}
                          className={`w-full flex items-center justify-between group font-medium transition-colors ${isActive ? 'text-brand-600' : 'hover:text-brand-600'}`}
                        >
                          <span>{category === 'All' ? 'All Products' : category}</span>
                          <span className={`py-0.5 px-2 rounded-full text-xs transition-colors ${isActive ? 'bg-brand-50 text-brand-600' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}`}>
                            {count}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>

            <div className="h-px bg-slate-200 w-full"></div>

            {/* Functional Price Range */}
            <div>
              <button 
                onClick={() => setIsPriceRangeOpen(!isPriceRangeOpen)}
                className="w-full flex items-center justify-between font-bold text-slate-900 mb-4 focus:outline-none"
              >
                <span>Price Range</span>
                <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isPriceRangeOpen ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
              </button>
              
              {isPriceRangeOpen && (
                <div className="flex items-center justify-between gap-4 mt-2">
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input 
                      type="number" 
                      value={minPrice}
                      onChange={(e) => { setMinPrice(e.target.value); setCurrentPage(1); }}
                      placeholder="Min"
                      className="w-full border border-slate-300 rounded-lg py-2 pl-6 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-700" 
                    />
                  </div>
                  <span className="text-slate-400">-</span>
                  <div className="relative w-full">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input 
                      type="number" 
                      value={maxPrice}
                      onChange={(e) => { setMaxPrice(e.target.value); setCurrentPage(1); }}
                      placeholder="Max"
                      className="w-full border border-slate-300 rounded-lg py-2 pl-6 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-slate-700" 
                    />
                  </div>
                </div>
              )}
            </div>

            <button onClick={() => setIsMobileFilterOpen(false)} className="w-full bg-slate-900 text-white font-semibold py-3 rounded-xl hover:bg-brand-600 transition-colors shadow-lg shadow-slate-200 lg:hidden">
              Apply Filters
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 w-full lg:w-3/4">
          
          {/* Top Bar */}
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200/60 flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
            
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <button onClick={() => setIsMobileFilterOpen(true)} className="lg:hidden flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
                Filters
              </button>
              
              <p className="text-sm text-slate-500 font-medium">
                Showing <span className="text-slate-900 font-bold">{totalProducts === 0 ? 0 : startIndex + 1}-{endIndex}</span> of <span className="text-slate-900 font-bold">{totalProducts}</span> products
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Seed Database Button (Only visible if empty) */}
              {products.length === 0 && (
                <button onClick={seedDatabase} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-brand-600 transition-colors shadow-sm">
                  Seed Database
                </button>
              )}

              {/* Custom Styled Sort Dropdown */}
              <label className="text-sm text-slate-500 font-medium whitespace-nowrap">Sort By:</label>
              <div className="relative w-full sm:w-48">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="w-full flex items-center justify-between bg-slate-50 border border-slate-200 text-slate-700 py-2 pl-4 pr-3 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 transition-shadow"
                >
                  <span className="truncate">{activeSortLabel}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isSortOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                <AnimatePresence>
                  {isSortOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setIsSortOpen(false)}></div>
                      <motion.div
                        initial={{ opacity: 0, y: 5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-40 overflow-hidden"
                      >
                        {SORT_OPTIONS.map(option => (
                          <button
                            key={option.id}
                            onClick={() => {
                              setSortOption(option.id);
                              setCurrentPage(1);
                              setIsSortOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                              sortOption === option.id 
                                ? 'bg-brand-50 text-brand-700 font-bold' 
                                : 'text-slate-600 hover:bg-gray-50 hover:text-slate-900'
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 && products.length > 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-20 px-6 text-center shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-1">No products found</h3>
              <p className="text-slate-500">We couldn't find anything matching your filters.</p>
              <button onClick={clearAllFilters} className="mt-6 text-brand-600 font-bold hover:text-brand-700 transition-colors">
                Clear all filters
              </button>
            </div>
          ) : filteredProducts.length === 0 && products.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-200 rounded-2xl py-20 px-6 text-center shadow-sm">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Store is empty</h3>
              <p className="text-slate-500 mb-6">There are no products in the database.</p>
              <button onClick={seedDatabase} className="bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-sm">
                Seed Database Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
              {currentProducts.map((product) => (
                <div 
                  key={product.id}
                  className="group bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 hover:shadow-xl hover:border-brand-500/30 transition-all duration-300 flex flex-col relative"
                >
                  {/* Status Badges */}
                  {product.stockCount > 0 && product.stockCount <= 5 && (
                    <div className="absolute top-6 left-6 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wide">
                      Low Stock
                    </div>
                  )}
                  {product.stockCount === 0 && (
                    <div className="absolute top-6 left-6 z-10 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm uppercase tracking-wide">
                      Sold Out
                    </div>
                  )}

                  <Link to="/products" className="relative overflow-hidden rounded-xl mb-4 aspect-[4/5] bg-slate-100 cursor-pointer block">
                    <img src={product.image} alt={product.name} className="object-cover w-full h-full mix-blend-multiply group-hover:scale-110 transition-transform duration-500" />
                    
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="bg-white text-slate-900 px-6 py-2.5 rounded-full font-bold hover:bg-brand-600 hover:text-white transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 shadow-lg">
                        Quick View
                      </button>
                    </div>
                  </Link>
                  
                  <div className="mb-1 text-xs text-slate-500 uppercase tracking-wide font-medium">{product.category || 'Gear'}</div>
                  <Link to="/products">
                    <h3 className="font-bold text-slate-900 mb-2 cursor-pointer hover:text-brand-600 transition-colors line-clamp-1">{product.name}</h3>
                  </Link>
                  
                  <div className="flex items-center gap-1 mb-4">
                    <div className="flex text-amber-400 text-[10px]">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                    </div>
                    <span className="text-xs text-slate-500 ml-1 font-medium">(24)</span>
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="font-extrabold text-xl text-slate-900">${product.price}</span>
                    <button 
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={product.stockCount === 0}
                      className="bg-slate-900 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-brand-600 transition-colors shadow-md active:scale-95 disabled:bg-gray-200 disabled:cursor-not-allowed"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m2-2h-4" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination UI */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center">
              <nav className="flex items-center gap-2" aria-label="Pagination">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${currentPage === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button 
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full font-medium transition-colors ${currentPage === i + 1 ? 'bg-brand-600 text-white font-bold shadow-md shadow-brand-600/30' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors ${currentPage === totalPages ? 'text-slate-300 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </>
  );
}