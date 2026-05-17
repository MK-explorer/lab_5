
import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  function addToCart(book) {
    setItems((prev) => {
      const existing = prev.find((i) => i.bookId === book.id);
      if (existing) {
        return prev.map((i) =>
          i.bookId === book.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { bookId: book.id, title: book.title, price: book.price, quantity: 1 }];
    });
  }

  function removeFromCart(bookId) {
    setItems((prev) => prev.filter((i) => i.bookId !== bookId));
  }

  function clearCart() {
    setItems([]);
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}