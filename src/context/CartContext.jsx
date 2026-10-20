import { createContext, useContext, useState } from 'react';

// 1. Create the context
const CartContext = createContext();

// 2. Create the Provider component
export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Function to add an item (or increase quantity if it already exists)
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Function to completely remove an item
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  // Function to empty the cart after a successful checkout
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

// 3. Create a custom hook so other components can easily grab the cart data
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => useContext(CartContext);