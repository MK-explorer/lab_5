// src/pages/HomePage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBooks } from "../api";
import { useCart } from "../context/CartContext";
import styles from "./HomePage.module.css";

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const { addToCart } = useCart();
  const [added, setAdded] = useState({});

  useEffect(() => {
    getBooks({ limit: 4 }).then((d) => setFeatured(d.books)).catch(console.error);
  }, []);

  function handleAdd(book) {
    addToCart(book);
    setAdded((prev) => ({ ...prev, [book.id]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [book.id]: false })), 1500);
  }

  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Книжковий світ у <em>кожному домі</em>
          </h1>
          <p className={styles.heroSub}>
            Понад {featured.length > 0 ? "15" : ""} книг для душі, розуму та натхнення. Українська класика, світові бестселери.
          </p>
          <Link to="/catalog" className={styles.heroBtn}>Перейти до каталогу →</Link>
        </div>
      </section>

      {/* Рекомендовані */}
      {featured.length > 0 && (
        <section className={styles.featured}>
          <h2 className={styles.sectionTitle}>
            Рекомендуємо <span className={styles.accent}>сьогодні</span>
          </h2>
          <div className={styles.divider} />
          <div className={styles.grid}>
            {featured.map((book) => (
              <div key={book.id} className={styles.card}>
                <div className={styles.cover}>
                  {book.cover
                    ? <img src={book.cover} alt={book.title} />
                    : <div className={styles.coverPlaceholder}>{book.title}</div>
                  }
                </div>
                <div className={styles.info}>
                  {book.genre && <span className={styles.genre}>{book.genre.toUpperCase()}</span>}
                  <h3 className={styles.bookTitle}>{book.title}</h3>
                  <p className={styles.author}>{book.author}</p>
                  <p className={styles.price}>{book.price} грн</p>
                  <button
                    className={`${styles.addBtn} ${added[book.id] ? styles.addedBtn : ""}`}
                    onClick={() => handleAdd(book)}
                  >
                    {added[book.id] ? "✓ Додано" : "Додати до кошика"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}