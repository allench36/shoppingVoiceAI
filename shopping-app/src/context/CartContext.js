"use client";

// context/CartContext.js
import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const addToCart = (product) => 
    setCart((prevCart) => [...prevCart, product]);

  // Remove one instance of a product by id (removes first found)
  const removeFromCart = (productId) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.id === productId);
      if (idx === -1) return prev;
      const copy = prev.slice();
      copy.splice(idx, 1);
      return copy;
    });
  };

  // Clear the entire cart
  const clearCart = () => setCart([]);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);