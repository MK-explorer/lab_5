// src/components/Navbar.jsx
// Замінити або оновити поточний Navbar
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>КнигаЛенд</Link>

      <div className={styles.links}>
        <Link to="/catalog" className={styles.link}>Каталог</Link>

        {user ? (
          <>
            <Link to="/profile" className={styles.link}>{user.name}</Link>
            <button
              className={styles.logoutBtn}
              onClick={() => { logout(); navigate("/"); }}
            >
              Вийти
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={styles.link}>Увійти</Link>
            <Link to="/register" className={styles.btnLink}>Реєстрація</Link>
          </>
        )}

        <Link to="/cart" className={styles.cart}>
          🛒 {count > 0 && <span className={styles.badge}>{count}</span>}
        </Link>
      </div>
    </nav>
  );
}