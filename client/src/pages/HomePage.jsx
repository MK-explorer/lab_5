import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBooks } from '../api';
import { useApp } from '../context/AppContext';

export default function HomePage() {
  const [books, setBooks]     = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getBooks({ limit: 4 })
      .then(data => { setBooks(data.books); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="hero-content">
          <h1>Книжковий світ у <em>кожному домі</em></h1>
          <p>Понад 15 книг для душі, розуму та натхнення. Українська класика, світові бестселери.</p>
          <button className="hero-btn" onClick={() => navigate('/catalog')}>
            Перейти до каталогу →
          </button>
        </div>
      </section>

      <div className="container page">
        <h2 className="section-heading">Рекомендуємо <em>сьогодні</em></h2>
        {loading ? (
          <div className="loading">Завантаження книг</div>
        ) : (
          <div className="books-grid">
            {books.map(book => <BookCard key={book.id} book={book} />)}
          </div>
        )}
        <div style={{ marginTop: '48px', textAlign: 'center' }}>
          <button className="btn-primary" onClick={() => navigate('/catalog')}>
            Переглянути весь каталог
          </button>
        </div>
      </div>
    </main>
  );
}

function BookCard({ book }) {
  const { addToCart, showToast } = useApp();

  function handleAdd() {
    addToCart(book);
    showToast(`«${book.title}» додано до кошика`);
  }

  return (
    <div className="book-card">
      <div className="book-cover">
        {book.cover
          ? <img src={book.cover} alt={book.title} />
          : <div className="book-cover-placeholder">{book.title}</div>
        }
      </div>
      <div className="book-info">
        {book.genre && <span className="book-genre">{book.genre.toUpperCase()}</span>}
        <h3 className="book-title">{book.title}</h3>
        <p className="book-author">{book.author}</p>
        <div className="book-footer">
          <span className="book-price">{book.price} грн</span>
          <button className="btn-add" onClick={handleAdd}>Додати до кошика</button>
        </div>
      </div>
    </div>
  );
}