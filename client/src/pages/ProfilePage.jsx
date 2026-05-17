// src/pages/ProfilePage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../api";
import { useAuth } from "../context/AuthContext";
import styles from "./ProfilePage.module.css";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    getOrders()
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.name}>{user.name}</h1>
          <p className={styles.email}>{user.email}</p>
        </div>
        <button className={styles.logoutBtn} onClick={() => { logout(); navigate("/"); }}>
          Вийти
        </button>
      </div>

      <h2 className={styles.section}>Мої замовлення</h2>
      {loading ? (
        <p className={styles.empty}>Завантаження...</p>
      ) : orders.length === 0 ? (
        <p className={styles.empty}>Замовлень ще немає</p>
      ) : (
        <div className={styles.orders}>
          {orders.map((order) => (
            <div key={order.id} className={styles.order}>
              <div className={styles.orderHeader}>
                <span>Замовлення #{order.id}</span>
                <span className={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString("uk-UA")}
                </span>
                <span className={`${styles.status} ${styles[order.status]}`}>{order.status}</span>
                <span className={styles.total}>{order.totalPrice} ₴</span>
              </div>
              <ul className={styles.items}>
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.book.title} × {item.quantity} — {item.price * item.quantity} ₴
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}