import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, doc, writeBatch, increment, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfirmModal from '../components/ConfirmModal';

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  // Data states
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Profile editing states
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(currentUser?.displayName || '');
  const [isSaving, setIsSaving] = useState(false);

  // Address editing states
  const [address, setAddress] = useState({ street: '', city: '', state: '', zip: '', country: 'United States' });
  const [editAddressData, setEditAddressData] = useState({ street: '', city: '', state: '', zip: '', country: 'United States' });
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);

  // Modal States
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch Orders
        const q = query(collection(db, 'orders'), where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        ordersData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setOrders(ordersData);

        // Fetch User Address Document
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists() && userDoc.data().address) {
          setAddress(userDoc.data().address);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Failed to log out');
    }
  };

  // Name Update Logic
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    
    setIsSaving(true);
    const saveToast = toast.loading('Updating profile...');
    
    try {
      await updateProfile(auth.currentUser, {
        displayName: newName.trim()
      });
      
      toast.success('Profile updated!', { id: saveToast });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error('Failed to update profile.', { id: saveToast });
    } finally {
      setIsSaving(false);
    }
  };

  // Address Update Logic
  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    setIsSavingAddress(true);
    const saveToast = toast.loading('Saving address...');
    
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      // setDoc with merge: true ensures we don't wipe out other user fields if they exist
      await setDoc(userRef, { address: editAddressData }, { merge: true });
      
      setAddress(editAddressData);
      toast.success('Address updated successfully!', { id: saveToast });
      setIsEditingAddress(false);
    } catch (error) {
      console.error("Error updating address:", error);
      toast.error('Failed to update address.', { id: saveToast });
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Order Cancel Logic
  const executeOrderCancellation = async () => {
    if (!orderToCancel) return;
    
    const { id: orderId, items } = orderToCancel;
    const cancelToast = toast.loading('Canceling order and restoring stock...');

    try {
      const batch = writeBatch(db);
      const orderRef = doc(db, 'orders', orderId);
      batch.update(orderRef, { status: 'Cancelled' });

      items.forEach(item => {
        const productRef = doc(db, 'products', item.id);
        batch.update(productRef, { stockCount: increment(item.quantity) });
      });

      await batch.commit();

      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: 'Cancelled' } : order
        )
      );

      toast.success('Order cancelled successfully', { id: cancelToast });
    } catch (error) {
      console.error("Cancel failed:", error);
      toast.error('Failed to cancel order', { id: cancelToast });
    } finally {
      setOrderToCancel(null);
    }
  };

  if (!currentUser) return null;

  const displayName = currentUser.displayName || currentUser.email.split('@')[0];
  const initialLetter = displayName.charAt(0).toUpperCase();

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
              <span className="hover:text-brand-600 transition-colors cursor-pointer">My Account</span>
            </div>
          </li>
          <li aria-current="page">
            <div className="flex items-center">
              <svg className="w-3 h-3 mx-2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              <span className="text-slate-900 font-medium">Dashboard</span>
            </div>
          </li>
        </ol>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        
        {/* Left Sidebar Navigation */}
        <aside className="w-full lg:w-64 shrink-0">
          {/* User Quick Info (Desktop only) */}
          <div className="hidden lg:flex items-center gap-4 mb-8 bg-white p-4 rounded-2xl border border-gray-200/60 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xl font-bold shrink-0">
              {initialLetter}
            </div>
            <div className="overflow-hidden">
              <h3 className="font-bold text-slate-900 leading-tight truncate">{displayName}</h3>
              <p className="text-xs text-slate-500">Verified Member</p>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0" style={{ scrollbarWidth: 'none' }}>
            <button className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-50 text-brand-700 font-semibold transition-colors shrink-0 whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-center" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              Dashboard
            </button>
            <Link to="/products" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium transition-colors shrink-0 whitespace-nowrap">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 text-center" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              Browse Catalog
            </Link>
            <div className="h-px bg-gray-200 my-2 hidden lg:block"></div>
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 font-medium transition-colors shrink-0 whitespace-nowrap w-full text-left">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-center" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              Logout
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 w-full overflow-hidden">
          
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Welcome back, {displayName.split(' ')[0]}!</h1>
            <p className="text-slate-500 mt-2 text-sm sm:text-base">Manage your account settings, track orders, and discover new products.</p>
          </div>

          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            
            {/* Account Information Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                  Account Info
                </h2>
                {!isEditing && (
                  <button onClick={() => { setNewName(currentUser.displayName || ''); setIsEditing(true); }} className="text-brand-600 text-sm font-semibold hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors">
                    Edit
                  </button>
                )}
              </div>
              
              <AnimatePresence mode="wait">
                {!isEditing ? (
                  <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col sm:flex-row gap-6 items-start sm:items-center relative z-10">
                    <div className="relative shrink-0">
                      <div className="w-20 h-20 rounded-full bg-brand-100 text-brand-700 border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold">
                        {initialLetter}
                      </div>
                    </div>
                    
                    <div className="space-y-2 w-full">
                      <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                        <span className="col-span-1 text-sm text-slate-500">Name</span>
                        <span className="col-span-2 text-sm font-medium text-slate-900 truncate">{displayName}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 pb-2">
                        <span className="col-span-1 text-sm text-slate-500">Email</span>
                        <span className="col-span-2 text-sm font-medium text-slate-900 truncate">{currentUser.email}</span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleUpdateProfile} className="relative z-10">
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Display Name</label>
                      <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter your name" required autoFocus className="w-full border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium" />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-slate-600 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                      <button type="submit" disabled={isSaving} className="flex-1 bg-brand-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-brand-500 transition-colors disabled:bg-brand-400">{isSaving ? 'Saving...' : 'Save'}</button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

            {/* Default Shipping Address Card */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-6 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Default Address
                </h2>
                {!isEditingAddress && (
                  <button onClick={() => { setEditAddressData(address); setIsEditingAddress(true); }} className="text-brand-600 text-sm font-semibold hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors">
                    Manage
                  </button>
                )}
              </div>
              
              <AnimatePresence mode="wait">
                {!isEditingAddress ? (
                  <motion.div key="view-address" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1 relative z-10 h-full">
                    <span className="inline-block bg-gray-100 text-slate-600 text-xs font-bold px-2 py-1 rounded mb-2 uppercase tracking-wide">Home</span>
                    <p className="font-bold text-slate-900">{displayName}</p>
                    {address.street ? (
                      <p className="text-slate-500 text-sm leading-relaxed mt-1">
                        {address.street}<br/>
                        {address.city}, {address.state} {address.zip}<br/>
                        {address.country}
                      </p>
                    ) : (
                      <p className="text-slate-400 text-sm italic mt-1">No default address saved yet.</p>
                    )}
                  </motion.div>
                ) : (
                  <motion.form key="edit-address" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleUpdateAddress} className="relative z-10 space-y-3">
                    <div>
                      <input type="text" placeholder="Street Address" value={editAddressData.street} onChange={(e) => setEditAddressData({...editAddressData, street: e.target.value})} required className="w-full border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="City" value={editAddressData.city} onChange={(e) => setEditAddressData({...editAddressData, city: e.target.value})} required className="w-full border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium" />
                      <input type="text" placeholder="State" value={editAddressData.state} onChange={(e) => setEditAddressData({...editAddressData, state: e.target.value})} required className="w-full border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="ZIP Code" value={editAddressData.zip} onChange={(e) => setEditAddressData({...editAddressData, zip: e.target.value})} required className="w-full border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium" />
                      <input type="text" placeholder="Country" value={editAddressData.country} onChange={(e) => setEditAddressData({...editAddressData, country: e.target.value})} required className="w-full border border-gray-200 p-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium" />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setIsEditingAddress(false)} className="flex-1 bg-gray-100 text-slate-600 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors">Cancel</button>
                      <button type="submit" disabled={isSavingAddress} className="flex-1 bg-brand-600 text-white py-2 rounded-xl text-sm font-bold hover:bg-brand-500 transition-colors disabled:bg-brand-400">{isSavingAddress ? 'Saving...' : 'Save'}</button>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

          </div>

          {/* Recent Orders Section */}
          <div>
            <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Recent Orders</h2>
              {orders.length > 0 && (
                <Link to="/products" className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors flex items-center gap-1">
                  Shop More <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              )}
            </div>
            
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden text-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left whitespace-nowrap">
                  <thead className="bg-gray-50 border-b border-gray-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                    <tr>
                      <th scope="col" className="px-6 py-4">Order ID</th>
                      <th scope="col" className="px-6 py-4">Date</th>
                      <th scope="col" className="px-6 py-4">Items</th>
                      <th scope="col" className="px-6 py-4">Total</th>
                      <th scope="col" className="px-6 py-4">Status</th>
                      <th scope="col" className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  
                  <tbody className="divide-y divide-gray-100 text-slate-700">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600 mx-auto"></div>
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                          You haven't placed any orders yet.
                        </td>
                      </tr>
                    ) : (
                      orders.map((order) => {
                        const isCancelled = order.status === 'Cancelled';
                        
                        return (
                          <tr key={order.id} className={`hover:bg-slate-50 transition-colors ${isCancelled ? 'opacity-75 bg-gray-50' : ''}`}>
                            <td className="px-6 py-4 font-mono text-slate-900">#{order.id.substring(0, 8).toUpperCase()}</td>
                            <td className="px-6 py-4 text-slate-500">
                              {new Date(order.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex -space-x-2">
                                {/* Stacked Images display for items */}
                                {order.items.slice(0, 3).map((item, idx) => (
                                  <img key={idx} className="w-8 h-8 rounded-md border-2 border-white object-cover bg-gray-100" src={item.image} alt={item.name} title={item.name} />
                                ))}
                                {order.items.length > 3 && (
                                  <div className="w-8 h-8 rounded-md border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                    +{order.items.length - 3}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className={`px-6 py-4 font-bold ${isCancelled ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              ${order.totalAmount}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                                isCancelled ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isCancelled ? 'bg-gray-400' : 'bg-blue-500 animate-pulse'}`}></span> 
                                {order.status || 'Processing'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              {!isCancelled ? (
                                <button 
                                  onClick={() => { setOrderToCancel(order); setIsCancelModalOpen(true); }}
                                  className="text-red-500 hover:text-red-700 font-bold bg-white border border-gray-200 hover:border-red-200 px-3 py-1.5 rounded-lg shadow-sm transition-all text-xs"
                                >
                                  Cancel
                                </button>
                              ) : (
                                <span className="text-xs font-bold text-slate-400 px-3 py-1.5">Voided</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      </div>

      <ConfirmModal 
        isOpen={isCancelModalOpen}
        onClose={() => {
          setIsCancelModalOpen(false);
          setOrderToCancel(null);
        }}
        onConfirm={executeOrderCancellation}
        title="Cancel Order?"
        message="Are you sure you want to cancel this order? This action cannot be undone, and the items will be returned to stock."
        confirmText="Yes, Cancel Order"
        cancelText="No, Keep It"
        isDestructive={true}
      />
    </>
  );
}