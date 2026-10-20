import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { doc, collection, runTransaction } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Financial Calculations
  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const subtotal = calculateSubtotal();
  const taxRate = 0.08; // 8% tax rate from reference
  const tax = subtotal * taxRate;
  const shippingCost = subtotal > 0 ? 15.00 : 0;
  const finalTotal = subtotal + tax + shippingCost;
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
    if (!currentUser) {
      toast('Please log in to checkout', { icon: '🔒' });
      navigate('/login');
      return;
    }

    setIsCheckingOut(true);
    const checkoutToast = toast.loading('Processing your order...');

    try {
      await runTransaction(db, async (transaction) => {
        // 1. Prepare references
        const productRefs = cart.map(item => doc(db, 'products', item.id));
        
        // 2. Read database state
        const productDocs = await Promise.all(productRefs.map(ref => transaction.get(ref)));

        // 3. Verify stock
        productDocs.forEach((pDoc, index) => {
          const item = cart[index];
          if (!pDoc.exists()) {
            throw new Error(`${item.name} no longer exists in the catalog.`);
          }
          if (pDoc.data().stockCount < item.quantity) {
            throw new Error(`Not enough stock for ${item.name}.`);
          }
        });

        // 4. Execute stock updates
        productDocs.forEach((pDoc, index) => {
          const item = cart[index];
          const newStock = pDoc.data().stockCount - item.quantity;
          transaction.update(pDoc.ref, { stockCount: newStock });
        });

        // 5. Create order receipt
        const orderRef = doc(collection(db, 'orders'));
        transaction.set(orderRef, {
          userId: currentUser.uid,
          userEmail: currentUser.email,
          items: cart,
          totalAmount: parseFloat(finalTotal.toFixed(2)),
          status: 'Processing',
          timestamp: new Date().toISOString()
        });
      });

      // Transaction Succeeded
      clearCart();
      toast.success('Order placed successfully! Receipt saved.', { id: checkoutToast });
      navigate('/profile'); 

    } catch (error) {
      console.error("Checkout failed:", error);
      toast.error(`Checkout failed: ${error.message}`, { id: checkoutToast });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <>
      {/* Breadcrumb */}
      <nav className="flex text-sm text-slate-500 mb-8" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link to="/" className="inline-flex items-center hover:text-brand-600 transition-colors">Home</Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="w-3 h-3 mx-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <Link to="/products" className="hover:text-brand-600 transition-colors">Shop</Link>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-3 h-3 mx-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <span className="text-slate-900 font-medium">Shopping Cart</span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Cart</h1>
          <p className="text-slate-500 mt-2"><span className="font-semibold text-slate-700">{totalItems}</span> items in your bag.</p>
        </div>
        <Link to="/products" className="text-brand-600 hover:text-brand-700 font-medium text-sm flex items-center gap-2 hidden sm:flex">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Continue Shopping
        </Link>
      </div>

      {cart.length === 0 ? (
        /* Empty Cart State */
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
          <div className="w-24 h-24 bg-brand-50 rounded-full flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-brand-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your cart is empty</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">Looks like you haven't added anything to your cart yet. Discover our latest collections and find something you love.</p>
          <Link to="/products" className="bg-brand-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-brand-700 transition-colors shadow-lg shadow-brand-600/20 active:scale-95">
            Start Shopping
          </Link>
        </motion.div>
      ) : (
        /* Cart Layout: Items + Summary */
        <div className="flex flex-col lg:flex-row gap-10 relative">
          
          {/* Cart Items Section */}
          <div className="flex-1 w-full lg:w-2/3">
            
            {/* Desktop Table Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 pb-4 border-b border-gray-200 text-sm font-bold text-slate-400 uppercase tracking-wider">
              <div className="col-span-6">Product Details</div>
              <div className="col-span-2 text-center">Quantity</div>
              <div className="col-span-2 text-right">Unit Price</div>
              <div class="col-span-2 text-right">Total</div>
            </div>

            {/* Cart Items Container */}
            <div className="divide-y divide-gray-100">
              <AnimatePresence>
                {cart.map((item) => (
                  <motion.div 
                    key={item.id} layout
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    className="py-6 flex flex-col md:grid md:grid-cols-12 md:items-center gap-6 group"
                  >
                    {/* Product Info */}
                    <div className="md:col-span-6 flex items-start gap-4">
                      <div className="w-24 h-24 shrink-0 bg-themebg rounded-xl overflow-hidden border border-gray-100 relative">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover mix-blend-multiply" />
                      </div>
                      <div className="flex flex-col justify-center py-1">
                        <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider mb-1">{item.category || 'Gear'}</span>
                        <Link to="/products" className="text-base font-bold text-slate-900 leading-tight hover:text-brand-600 transition-colors line-clamp-1">{item.name}</Link>
                        {/* Mobile unit price */}
                        <p className="text-slate-900 font-bold mt-2 md:hidden">${item.price.toFixed(2)}</p>
                      </div>
                    </div>

                    {/* Quantity Controls */}
                    <div className="md:col-span-2 flex items-center justify-between md:justify-center">
                      <span className="text-sm font-medium text-slate-500 md:hidden">Quantity</span>
                      <div className="flex items-center border border-gray-200 rounded-full bg-white px-2 py-1 shadow-sm">
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          {item.quantity === 1 ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" /></svg>
                          )}
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                        <button 
                          onClick={() => addToCart(item)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        </button>
                      </div>
                    </div>

                    {/* Unit Price (Desktop only) */}
                    <div className="hidden md:block md:col-span-2 text-right">
                      <span className="font-bold text-slate-900">${item.price.toFixed(2)}</span>
                    </div>

                    {/* Total & Remove */}
                    <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-4">
                      <span className="text-sm font-medium text-slate-500 md:hidden">Total</span>
                      <div className="flex items-center gap-4">
                        <span className="font-extrabold text-lg text-slate-900">${(item.price * item.quantity).toFixed(2)}</span>
                        <button 
                          onClick={() => {
                            removeFromCart(item.id);
                            toast('Item removed', { icon: '🗑️' });
                          }}
                          className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100">
              <Link to="/products" className="text-slate-600 font-bold hover:text-brand-600 transition-colors sm:hidden w-full text-center py-2.5 border border-gray-200 rounded-xl">
                Continue Shopping
              </Link>
              <div className="hidden sm:block"></div> {/* Spacer for desktop */}
              <button 
                onClick={clearCart}
                className="text-sm text-red-500 hover:text-red-600 font-bold flex items-center gap-2 transition-colors px-4 py-2 hover:bg-red-50 rounded-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                Clear Cart
              </button>
            </div>

          </div>

          {/* Order Summary Section */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 lg:p-8 lg:sticky lg:top-28">
              <h2 className="text-xl font-extrabold text-slate-900 mb-6 tracking-tight">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="font-bold text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span className="flex items-center gap-1">Shipping</span>
                  <span className="font-bold text-slate-900">${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-bold text-slate-900">${tax.toFixed(2)}</span>
                </div>
              </div>

              {/* Discount Code */}
              <div className="mb-6">
                <p className="text-sm font-bold text-slate-700 mb-2">Discount Code</p>
                <div className="flex gap-2">
                  <input type="text" placeholder="Enter code" className="w-full border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 uppercase transition-shadow" />
                  <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-600 transition-colors shadow-sm">Apply</button>
                </div>
              </div>

              <div className="h-px w-full bg-gray-100 mb-6"></div>

              <div className="flex justify-between items-end mb-8">
                <div>
                  <p className="text-lg font-bold text-slate-900">Total</p>
                  <p className="text-xs font-medium text-slate-400 mt-1">Including ${tax.toFixed(2)} in taxes</p>
                </div>
                <span className="text-3xl font-extrabold text-brand-600 tracking-tight">${finalTotal.toFixed(2)}</span>
              </div>

              <button 
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className={`w-full text-white py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-sm ${
                  isCheckingOut ? 'bg-brand-400 cursor-not-allowed' : 'bg-brand-600 hover:bg-brand-700 hover:shadow-brand-600/30 active:scale-[0.98]'
                }`}
              >
                {isCheckingOut ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Checkout
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </>
                )}
              </button>

              {/* Trust/Payment Badges */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Secure Checkout Guarantee</p>
                <div className="flex justify-center items-center gap-4 text-slate-300 font-extrabold text-sm tracking-wider">
                  <span>VISA</span>
                  <span>MASTERCARD</span>
                  <span>PAYPAL</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </>
  );
}