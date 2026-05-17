// src/pages/CartPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../api";
import styles from "./CartPage.module.css";

export default function CartPage() {
  const { items, removeFromCart, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleOrder() {
    if (!user) {
      navigate("/login");
      return;
    }
    if (items.length === 0) {
      setError("Кошик порожній");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await createOrder(items.map((i) => ({ bookId: i.bookId, quantity: i.quantity })));
      clearCart();
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.success}>
          <span className={styles.successIcon}>✅</span>
          <h2>Замовлення оформлено!</h2>
          <p>Дякуємо за покупку. Деталі можна переглянути у профілі.</p>
          <div className={styles.successLinks}>
            <Link to="/profile" className={styles.btnPrimary}>Мій акаунт</Link>
            <Link to="/catalog" className={styles.btnSecondary}>Продовжити покупки</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Кошик</h1>

      {items.length === 0 ? (
        <div className={styles.empty}>
          <p>Кошик порожній</p>
          <Link to="/catalog" className={styles.btnPrimary}>До каталогу</Link>
        </div>
      ) : (
        <div className={styles.layout}>
          {/* Список товарів */}
          <div className={styles.items}>
            {items.map((item) => (
              <div key={item.bookId} className={styles.item}>
                <div className={styles.itemInfo}>
                  <h3 className={styles.itemTitle}>{item.title}</h3>
                  <p className={styles.itemPrice}>{item.price} ₴ × {item.quantity}</p>
                </div>
                <div className={styles.itemRight}>
                  <span className={styles.itemTotal}>{item.price * item.quantity} ₴</span>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.bookId)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Підсумок */}
          <div className={styles.summary}>
            <h2 className={styles.summaryTitle}>Підсумок</h2>
            <div className={styles.summaryRow}>
              <span>Товарів:</span>
              <span>{items.reduce((s, i) => s + i.quantity, 0)} шт.</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Доставка:</span>
              <span>Безкоштовно</span>
            </div>
            <div className={styles.summaryTotal}>
              <span>Разом:</span>
              <span>{total} ₴</span>
            </div>
            {error && <p className={styles.error}>{error}</p>}
            {!user && (
              <p className={styles.hint}>
                <Link to="/login">Увійдіть</Link>, щоб оформити замовлення
              </p>
            )}
            <button
              className={styles.orderBtn}
              onClick={handleOrder}
              disabled={loading}
            >
              {loading ? "Оформлення..." : "Оформити замовлення"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}