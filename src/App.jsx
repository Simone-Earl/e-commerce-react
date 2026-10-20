import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Profile from './pages/Profile';

// Security
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      {/* Flex layout forces the footer to stick to the bottom of the screen */}
      <div className="flex flex-col min-h-screen bg-themebg text-slate-800 font-sans selection:bg-brand-500 selection:text-white transition-colors duration-300">
        <Navbar />
        <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} /> 
        
        {/* flex-grow allows the main content area to expand and push the footer down */}
        <main className="flex-grow">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            
            <Route path="/products" element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Products />
              </div>
            } />
            
            <Route path="/cart" element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Cart />
              </div>
            } />
            
            <Route path="/login" element={
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <Login />
              </div>
            } />
            
            {/* Protected Routes (Requires Login) */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                  <Profile />
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;