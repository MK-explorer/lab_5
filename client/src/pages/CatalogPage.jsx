import { useState, useEffect, useMemo } from 'react';
import { getBooks } from '../api';
import { useApp } from '../context/AppContext';

export default function CatalogPage() {
  const [books, setBooks]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeGenre, setActiveGenre] = useState('all');
  const [authorSearch, setAuthorSearch] = useState('');

  useEffect(() => {
    getBooks({ limit: 100 })
      .then(data => { setBooks(data.books); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const genres = useMemo(() => {
    const set = new Set(books.map(b => b.genre).filter(Boolean));
    return ['all', ...Array.from(set)];
  }, [books]);

  const filtered = useMemo(() => books.filter(book => {
    const genreOk  = activeGenre === 'all' || book.genre === activeGenre;
    const authorOk = !authorSearch.trim() ||
      book.author.toLowerCase().includes(authorSearch.toLowerCase().trim());
    return genreOk && authorOk;
  }), [books, activeGenre, authorSearch]);

  return (
    <div className="container page">
      <h2 className="section-heading">Каталог <em>книг</em></h2>

      <div className="filter-bar">
        <span className="filter-label">Жанр:</span>
        {genres.map(genre => (
          <button
            key={genre}
            className={`genre-btn${activeGenre === genre ? ' active' : ''}`}
            onClick={() => setActiveGenre(genre)}
          >
            {genre === 'all' ? 'Всі' : genre}
          </button>
        ))}
      </div>

      <div className="filter-bar" style={{ marginBottom: '32px' }}>
        <span className="filter-label">Автор:</span>
        <input
          type="text"
          className="search-input"
          placeholder="Пошук за автором..."
          value={authorSearch}
          onChange={e => setAuthorSearch(e.target.value)}
        />
        {authorSearch && (
          <button className="genre-btn" style={{ color: 'var(--danger)' }}
            onClick={() => setAuthorSearch('')}>
            ✕ Скинути
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading">Завантаження книг</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>Книг не знайдено</h3>
          <button className="btn-primary"
            onClick={() => { setActiveGenre('all'); setAuthorSearch(''); }}>
            Скинути фільтри
          </button>
        </div>
      ) : (
        <>
          <p style={{ marginBottom: '20px', fontSize: '0.88rem', color: 'var(--text-lt)' }}>
            Знайдено: <strong style={{ color: 'var(--walnut)' }}>{filtered.length}</strong>
          </p>
          <div className="books-grid">
            {filtered.map(book => <BookCard key={book.id} book={book} />)}
          </div>
        </>
      )}
    </div>
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
          ? <img src={book.cover} alt={book.title}
              onError={e => { e.target.style.display='none'; e.target.parentNode.querySelector('.book-cover-placeholder').style.display='flex'; }} />
          : null}
        <div className="book-cover-placeholder" style={{ display: book.cover ? 'none' : 'flex' }}>
          {book.title}
        </div>
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