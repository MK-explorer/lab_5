import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const { currentUser, logout, cart } = useApp();
  const count = cart.reduce((sum, i) => sum + i.qty, 0);
  const navigate = useNavigate();

  return (
    <nav className={styles.nav}>
      <Link to="/" className={styles.logo}>КнигаЛенд</Link>

      <div className={styles.links}>
        <Link to="/catalog" className={styles.link}>Каталог</Link>

        {currentUser ? (
          <>
            <Link to="/account" className={styles.link}>{currentUser.name}</Link>
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

        <Link to="/cart" className={styles.cartBtn}>
          🛒 Кошик
          {count > 0 && <span className={styles.badge}>{count}</span>}
        </Link>
      </div>
    </nav>
  );
}