import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const CATEGORY_EMOJI = { Main: '🍔', Salad: '🥗', Pizza: '🍕', Drinks: '🥤', Dessert: '🍰', Soup: '🍜', default: '🍽' };

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [error, setError] = useState('');
  const [orderMessage, setOrderMessage] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3000/menu', { withCredentials: true })
      .then(res => setMenuItems(res.data))
      .catch(() => setError('Failed to load menu'));
  }, []);

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const getTotal = () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0).toFixed(2);

  const placeOrder = async () => {
    if (!user) { navigate('/login'); return; }
    if (cart.length === 0) return;
    try {
      await axios.post('http://localhost:3000/orders',
        { items: cart.map(i => ({ menu_item_id: i.id, quantity: i.quantity })) },
        { withCredentials: true }
      );
      setCart([]);
      setOrderMessage('Order placed successfully!');
      setTimeout(() => setOrderMessage(''), 3000);
    } catch (err) {
      setOrderMessage(err.response?.data?.message || 'Failed to place order');
    }
  };

  const handleLogout = async () => {
    await axios.get('http://localhost:3000/logout', { withCredentials: true });
    logout();
    navigate('/login');
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/menu" className="navbar-brand">🍽 Cafeteria<span>App</span></Link>
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/menu" className="nav-link active">Menu</Link>
              <Link to="/my-orders" className="nav-link">My orders</Link>
              {user.role === 'staff' && <Link to="/staff" className="nav-link">Staff</Link>}
              <button className="btn btn-primary btn-sm" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <Link to="/login" className="nav-link">Login</Link>
          )}
        </div>
      </nav>
      <div className="page">
        <p className="page-title">What would you like today?</p>
        <p className="page-sub">Fresh meals made daily by our kitchen staff</p>
        {error && <div className="alert alert-error">{error}</div>}
        {orderMessage && <div className="alert alert-success">{orderMessage}</div>}

        {!user && (
  <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
    You need to <a href="/login" style={{ color: '#b0ff5e' }}>login</a> to place an order
  </div>
)}
        <div className="menu-grid">
          {menuItems.map(item => (
            <div key={item.id} className="card">
              <div className="menu-card-img">
                {CATEGORY_EMOJI[item.category] || CATEGORY_EMOJI.default}
              </div>
              <div className="menu-card-body">
                <p className="menu-card-name">{item.name}</p>
                <p className="menu-card-cat">{item.category}</p>
                <p className="menu-card-desc">{item.description}</p>
                <div className="menu-card-footer">
                  <span className="price">${Number(item.price).toFixed(2)}</span>
                  <button className="btn btn-primary btn-sm" onClick={() => addToCart(item)}>+ Add</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cart.length > 0 && user && (
          <div className="cart-box">
            <p className="cart-title">Your cart <span className="cart-count">{cart.length} items</span></p>
            {cart.map(item => (
              <div key={item.id} className="cart-row">
                <span>{item.name} x{item.quantity}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  ${(item.price * item.quantity).toFixed(2)}
                  <button className="btn btn-danger btn-sm" onClick={() => removeFromCart(item.id)}>✕</button>
                </span>
              </div>
            ))}
            <div className="cart-total">
              <span className="cart-total-label">Total: ${getTotal()}</span>
              <button className="btn btn-primary" onClick={placeOrder}>Place order</button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}