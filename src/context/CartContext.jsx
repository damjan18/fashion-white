import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getFromStorage, saveToStorage } from '@utils/helpers';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    return getFromStorage('cart', []);
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    saveToStorage('cart', cart);
  }, [cart]);

  const addToCart = useCallback((product, variant, quantity = 1) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(
        item => item.productId === product.id && item.variantId === variant.id
      );

      if (existingIndex > -1) {
        // Update quantity
        const newCart = [...prevCart];
        newCart[existingIndex] = {
          ...newCart[existingIndex],
          quantity: newCart[existingIndex].quantity + quantity,
        };
        return newCart;
      }

      // Add new item
      return [...prevCart, {
        productId: product.id,
        variantId: variant.id,
        name: product.name_sr,
        nameEn: product.name_en,
        size: variant.size,
        price: product.base_price,
        quantity,
        image: product.image_url,
        maxQuantity: variant.quantity,
      }];
    });
    
    setIsCartOpen(true);
  }, []);

  const removeFromCart = useCallback((productId, variantId) => {
    setCart(prevCart => 
      prevCart.filter(
        item => !(item.productId === productId && item.variantId === variantId)
      )
    );
  }, []);

  const updateQuantity = useCallback((productId, variantId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId, variantId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.productId === productId && item.variantId === variantId
          ? { ...item, quantity: Math.min(newQuantity, item.maxQuantity) }
          : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const value = {
    cart,
    isCartOpen,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    openCart,
    closeCart,
    totalItems,
    totalPrice,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
