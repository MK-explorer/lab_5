import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { createOrder } from '../api';

export default function CartPage() {
  const { cart, currentUser, clearCart, showToast, incrementQty, decrementQty, removeFromCart } = useApp();
  const navigate = useNavigate();

  const totalQty   = cart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const delivery   = totalPrice >= 500 ? 0 : 75;
  const grandTotal = totalPrice + delivery;

  async function handleOrder() {
    if (!currentUser) {
      showToast('Увійдіть до акаунту для оформлення замовлення');
      return;
    }
    try {
      const order = await createOrder(
        cart.map(i => ({ bookId: i.id, quantity: i.qty }))
      );
      clearCart();
      const shortId = String(order.id).slice(-5).toUpperCase();
      showToast(`Замовлення №${shortId} оформлено! `);
      navigate('/account');
    } catch (err) {
      console.error(err);
      showToast('Помилка збереження замовлення. Спробуйте ще раз.');
    }
  }

  if (cart.length === 0) return (
    <div className="container page">
      <div className="empty-state">
        <div className="empty-icon">🛒</div>
        <h3>Кошик порожній</h3>
        <button className="btn-primary" onClick={() => navigate('/catalog')}>До каталогу</button>
      </div>
    </div>
  );

  return (
    <div className="container page">
      <h2 className="section-heading">Мій <em>кошик</em></h2>
      <div className="cart-layout">
        <div className="cart-items-list">
          {cart.map(item => (
            <CartItem
              key={item.id}
              item={item}
              onIncrement={() => incrementQty(item.id)}
              onDecrement={() => decrementQty(item.id)}
              onRemove={() => removeFromCart(item.id)}
            />
          ))}
        </div>
        <aside className="cart-summary-box">
          <h3>Підсумок замовлення</h3>
          <div className="summary-row">
            <span>Товари ({totalQty} шт.):</span><span>{totalPrice} грн</span>
          </div>
          <div className="summary-row">
            <span>Доставка:</span>
            <span style={{ color: delivery === 0 ? 'var(--success)' : 'inherit' }}>
              {delivery === 0 ? 'Безкоштовно' : `${delivery} грн`}
            </span>
          </div>
          {delivery > 0 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--text-lt)', marginTop: '4px' }}>
              Безкоштовна доставка від 500 грн
            </p>
          )}
          <div className="summary-row summary-total">
            <span>Разом:</span><span>{grandTotal} грн</span>
          </div>
          <button className="btn-order" onClick={handleOrder}>
            {currentUser ? 'Оформити замовлення' : ' Увійдіть для оформлення'}
          </button>
        </aside>
      </div>
    </div>
  );
}

function CartItem({ item, onIncrement, onDecrement, onRemove }) {
  return (
    <div className="cart-item">
      <div className="cart-item-cover">
        {item.cover
          ? <img src={item.cover} alt={item.title} />
          : <div className="cart-item-placeholder">{item.title[0]}</div>
        }
      </div>
      <div className="cart-item-info">
        <h4 className="cart-item-title">{item.title}</h4>
        <p className="cart-item-author">{item.author}</p>
        <p className="cart-item-price">{item.price} грн</p>
      </div>
      <div className="cart-item-controls">
        <div className="qty-counter">
          <button className="qty-btn" onClick={onDecrement}>−</button>
          <span className="qty-num">{item.qty}</span>
          <button className="qty-btn" onClick={onIncrement}>+</button>
        </div>
        <p className="cart-item-total">{item.price * item.qty} грн</p>
        <button className="cart-item-remove" onClick={onRemove}>✕</button>
      </div>
    </div>
  );
}