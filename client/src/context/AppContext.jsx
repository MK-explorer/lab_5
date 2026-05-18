import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getProfile } from '../api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [cart, setCart]               = useState([]);
  const [toast, setToast]             = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  // Відновити сесію при завантаженні
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getProfile()
        .then(user => setCurrentUser(user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setAuthLoading(false));
    } else {
      setAuthLoading(false);
    }
  }, []);

  function saveAuth(token, user) {
    localStorage.setItem('token', token);
    setCurrentUser(user);
  }

  function logout() {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setCart([]);
  }

  // ── Cart ────────────────────────────────
  function addToCart(book) {
    setCart(prev => {
      const existing = prev.find(i => i.id === book.id);
      if (existing) {
        return prev.map(i => i.id === book.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...book, qty: 1 }];
    });
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(i => i.id !== id));
  }

  function incrementQty(id) {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + 1 } : i));
  }

  function decrementQty(id) {
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, qty: i.qty - 1 } : i).filter(i => i.qty > 0)
    );
  }

  function clearCart() {
    setCart([]);
  }

  // ── Toast ───────────────────────────────
  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }, []);

  return (
    <AppContext.Provider value={{
      currentUser, saveAuth, logout, authLoading,
      cart, addToCart, removeFromCart, incrementQty, decrementQty, clearCart,
      toast, showToast,
    }}>
      {children}
      {toast && <div className="toast">{toast}</div>}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}