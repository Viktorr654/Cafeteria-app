import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('http://localhost:3000/my-orders', { withCredentials: true })
      .then(res => setOrders(res.data))
      .catch(() => setError('Failed to load orders'));
  }, []);

  const cancelOrder = async (id) => {
    try {
      await axios.delete(`http://localhost:3000/orders/${id}`, { withCredentials: true });
      setOrders(prev => prev.filter(o => o.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel order');
    }
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/menu" className="navbar-brand">🍽 Cafeteria<span>App</span></Link>
        <div className="navbar-links">
          <Link to="/menu" className="nav-link">Menu</Link>
          <Link to="/my-orders" className="nav-link active">My orders</Link>
        </div>
      </nav>
      <div className="page">
        <p className="page-title">My orders</p>
        <p className="page-sub">Track your current and past orders</p>
        {error && <div className="alert alert-error">{error}</div>}
        {orders.length === 0 && !error && <p className="empty">You haven't placed any orders yet.</p>}
        {orders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <span className="order-id">Order #{order.id}</span>
              <span className={`badge badge-${order.status}`}>{order.status}</span>
            </div>
            <p className="order-date">{new Date(order.order_date).toLocaleString()}</p>
            {order.items.map((item, i) => (
              <p key={i} className="order-item-row">{item.name} x{item.quantity} — ${Number(item.price).toFixed(2)}</p>
            ))}
            <div className="order-footer">
              <span className="order-total">Total: ${Number(order.total_price).toFixed(2)}</span>
              {order.status === 'pending' && (
                <button className="btn btn-danger btn-sm" onClick={() => cancelOrder(order.id)}>Cancel</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}