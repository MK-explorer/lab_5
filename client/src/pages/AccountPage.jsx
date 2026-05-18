import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { getOrders } from '../api';

export default function AccountPage() {
  const { currentUser, logout, showToast } = useApp();
  const [orders, setOrders]               = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) { setOrders([]); return; }
    setOrdersLoading(true);
    getOrders()
      .then(data => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setOrdersLoading(false));
  }, [currentUser]);

  if (!currentUser) return (
    <div className="container page">
      <div className="empty-state">
        <div className="empty-icon"></div>
        <h3>Увійдіть до акаунту</h3>
        <p>Натисніть кнопку «Увійти» у шапці сайту.</p>
      </div>
    </div>
  );

  return (
    <div className="container page">
      <h2 className="section-heading">Мій <em>акаунт</em></h2>
      <div className="account-layout">
        <div>
          <UserInfo user={currentUser} />
          <button
            onClick={() => { logout(); showToast('Ви вийшли з акаунту'); navigate('/'); }}
            style={{
              marginTop: '16px', width: '100%', background: 'none',
              border: '1px solid #e0b0a0', color: 'var(--danger)',
              padding: '10px', borderRadius: 'var(--radius)',
              fontSize: '0.88rem', cursor: 'pointer',
            }}>
            Вийти з акаунту
          </button>
        </div>

        <div className="orders-section">
          <h3>Історія покупок</h3>
          {ordersLoading ? (
            <div className="loading" style={{ padding: '40px 0' }}>Завантаження замовлень…</div>
          ) : orders.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <div className="empty-icon"></div>
              <p>У вас ще немає замовлень.</p>
            </div>
          ) : (
            orders.map(order => <OrderCard key={order.id} order={order} />)
          )}
        </div>
      </div>
    </div>
  );
}

function UserInfo({ user }) {
  const initials = user.name ? user.name[0].toUpperCase() : 'U';
  const memberSince = new Date(user.createdAt || Date.now())
    .toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' });

  return (
    <div className="user-info-card">
      <div className="user-avatar">{initials}</div>
      <h3 className="user-name">{user.name}</h3>
      <p className="user-email">{user.email}</p>
      <p className="user-since">Учасник з: {memberSince}</p>
      <div className="user-divider" />
      <div className="user-row"><span>Логін</span><strong>{user.name}</strong></div>
      <div className="user-row"><span>Email</span><strong>{user.email}</strong></div>
    </div>
  );
}

function OrderCard({ order }) {
  const statusMap = {
    pending:  { label: 'В обробці',  cls: 'processing' },
    paid:     { label: 'Оплачено',   cls: 'delivered'  },
    shipped:  { label: 'Відправлено',cls: 'delivered'  },
  };
  const { label, cls } = statusMap[order.status] || statusMap.pending;

  const dateStr = new Date(order.createdAt)
    .toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' });
  const shortId = String(order.id).slice(-5).toUpperCase();

  return (
    <div className="order-card">
      <div className="order-header">
        <span className="order-num">Замовлення #{shortId}</span>
        <span className="order-date">{dateStr}</span>
        <span className={`order-status ${cls}`}>{label}</span>
      </div>
      <ul className="order-items">
        {(order.items ?? []).map((item, i) => (
          <li key={i}>
            {item.book?.title ?? item.title} × {item.quantity} — <strong>{item.price * item.quantity} грн</strong>
          </li>
        ))}
      </ul>
      <p className="order-total">Сума: {order.totalPrice} грн</p>
    </div>
  );
}