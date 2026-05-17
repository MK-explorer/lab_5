// src/pages/CatalogPage.jsx
import { useState, useEffect } from "react";
import { getBooks } from "../api";
import { useCart } from "../context/CartContext";
import styles from "./CatalogPage.module.css";

const GENRES = ["Всі", "Поезія", "Класика", "Проза", "Драма", "Фантастика", "Детектив"];

function StarRating({ rating = 0 }) {
  return (
    <div className={styles.stars}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.round(rating) ? styles.starFilled : styles.starEmpty}>★</span>
      ))}
      <span className={styles.ratingNum}>{rating > 0 ? rating.toFixed(1) : ""}</span>
    </div>
  );
}

export default function CatalogPage() {
  const [data, setData] = useState({ books: [], total: 0 });
  const [genre, setGenre] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState({});
  const { addToCart } = useCart();

  useEffect(() => {
    setLoading(true);
    const params = { page, limit: 12 };
    if (genre) params.genre = genre;
    if (search) params.search = search;
    getBooks(params).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [genre, search, page]);

  function handleSearch(e) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function handleAdd(book) {
    addToCart(book);
    setAdded((prev) => ({ ...prev, [book.id]: true }));
    setTimeout(() => setAdded((prev) => ({ ...prev, [book.id]: false })), 1500);
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Каталог книг</h1>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input className={styles.searchInput} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Пошук за назвою або автором..." />
          <button className={styles.searchBtn} type="submit">Знайти</button>
        </form>
      </div>
      <div className={styles.genres}>
        {GENRES.map((g) => (
          <button key={g} className={`${styles.genreBtn} ${(g === "Всі" ? !genre : genre === g) ? styles.active : ""}`} onClick={() => { setGenre(g === "Всі" ? "" : g); setPage(1); }}>{g}</button>
        ))}
      </div>
      {loading ? <div className={styles.loading}>Завантаження...</div> : data.books.length === 0 ? <div className={styles.empty}>Книги не знайдено</div> : (
        <>
          <div className={styles.grid}>
            {data.books.map((book) => {
              const avgRating = book.reviews?.length ? book.reviews.reduce((s, r) => s + r.rating, 0) / book.reviews.length : 0;
              return (
                <div key={book.id} className={styles.card}>
                  <div className={styles.cover}>
                    {book.cover ? <img src={book.cover} alt={book.title} /> : <div className={styles.coverPlaceholder}>{book.title}</div>}
                  </div>
                  <div className={styles.info}>
                    {book.genre && <span className={styles.genre}>{book.genre}</span>}
                    <h3 className={styles.bookTitle}>{book.title}</h3>
                    <p className={styles.author}>{book.author}</p>
                    {avgRating > 0 && <StarRating rating={avgRating} />}
                    <div className={styles.footer}>
                      <span className={styles.price}>{book.price} грн</span>
                      <button className={`${styles.addBtn} ${added[book.id] ? styles.addedBtn : ""}`} onClick={() => handleAdd(book)}>
                        {added[book.id] ? "✓ Додано" : "Додати до кошика"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {data.totalPages > 1 && (
            <div className={styles.pagination}>
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`${styles.pageBtn} ${p === page ? styles.activePage : ""}`} onClick={() => setPage(p)}>{p}</button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}