// src/pages/ProfilePage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOrders } from "../api";
import { useAuth } from "../context/AuthContext";
import styles from "./ProfilePage.module.css";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });
}

function shortId(id) {
  return String(id).slice(-5).toUpperCase();
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    getOrders().then(setOrders).catch(console.error).finally(() => setLoading(false));
  }, [user, navigate]);

  if (!user) return null;

  const initials = user.name ? user.name[0].toUpperCase() : "U";
  const memberSince = new Date().toLocaleDateString("uk-UA", { month: "long", year: "numeric" });

  return (
    <div className={styles.page}>
      {/* Ліва панель */}
      <aside className={styles.sidebar}>
        <div className={styles.avatar}>{initials}</div>
        <h2 className={styles.userName}>{user.name}</h2>
        <p className={styles.userEmail}>{user.email}</p>
        <p className={styles.memberSince}>Учасник з: {memberSince}</p>
        <div className={styles.divider} />
        <div className={styles.infoRow}><span className={styles.infoLabel}>Логін</span><span className={styles.infoValue}>{user.name}</span></div>
        <div className={styles.infoRow}><span className={styles.infoLabel}>Email</span><span className={styles.infoValue}>{user.email}</span></div>
        <button className={styles.logoutBtn} onClick={() => { logout(); navigate("/"); }}>Вийти з акаунту</button>
      </aside>

      {/* Права панель */}
      <main className={styles.main}>
        <h2 className={styles.ordersTitle}>Історія покупок</h2>
        {loading ? (
          <p className={styles.empty}>Завантаження...</p>
        ) : orders.length === 0 ? (
          <p className={styles.empty}>Замовлень ще немає</p>
        ) : (
          <div className={styles.orders}>
            {orders.map((order) => (
              <div key={order.id} className={styles.order}>
                <div className={styles.orderHeader}>
                  <div className={styles.orderLeft}>
                    <span className={styles.orderId}>Замовлення #{shortId(order.id)}</span>
                    <span className={styles.orderDate}>{formatDate(order.createdAt)}</span>
                  </div>
                  <span className={`${styles.status} ${styles[order.status]}`}>
                    {order.status === "pending" ? "В обробці" : order.status === "paid" ? "Оплачено" : "Відправлено"}
                  </span>
                </div>
                <div className={styles.orderItems}>
                  {order.items.map((item) => (
                    <div key={item.id} className={styles.orderItem}>
                      {item.book.title} × {item.quantity} — <strong>{item.price * item.quantity} грн</strong>
                    </div>
                  ))}
                </div>
                <div className={styles.orderTotal}>Сума: {order.totalPrice} грн</div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}