import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const emptyForm = { name: '', category: '', price: '', description: '' };

export default function StaffDashboard() {
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('menu');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchMenu(); fetchOrders(); }, []);

  const fetchMenu = () => axios.get('http://localhost:3000/menu', { withCredentials: true }).then(res => setMenuItems(res.data));
  const fetchOrders = () => axios.get('http://localhost:3000/orders', { withCredentials: true }).then(res => setOrders(res.data));

  const handleSubmit = async () => {
    setError(''); setMessage('');
    if (!form.name || !form.category || !form.price) { setError('Name, category and price are required'); return; }
    try {
      if (editingId) {
        await axios.put(`http://localhost:3000/menu/${editingId}`, { ...form, available: true }, { withCredentials: true });
        setMessage('Item updated successfully');
      } else {
        await axios.post('http://localhost:3000/menu', form, { withCredentials: true });
        setMessage('Item added successfully');
      }
      setForm(emptyForm); setEditingId(null); fetchMenu();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving item');
    }
  };

  const handleEdit = (item) => {
    setForm({ name: item.name, category: item.category, price: item.price, description: item.description || '' });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await axios.delete(`http://localhost:3000/menu/${id}`, { withCredentials: true });
      fetchMenu();
    } catch { setError('Failed to delete item'); }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await axios.put(`http://localhost:3000/orders/${orderId}/status`, { status }, { withCredentials: true });
      fetchOrders();
    } catch { setError('Failed to update status'); }
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/menu" className="navbar-brand">🍽 Cafeteria<span>App</span></Link>
        <div className="navbar-links">
          <Link to="/menu" className="nav-link">Menu</Link>
          <Link to="/staff" className="nav-link active">Staff dashboard</Link>
        </div>
      </nav>
      <div className="page">
        <p className="page-title">Staff dashboard</p>
        <p className="page-sub">Manage menu items and incoming orders</p>

        <div className="staff-tabs">
          <button className={`btn btn-sm ${tab === 'menu' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('menu')}>Menu items</button>
          <button className={`btn btn-sm ${tab === 'orders' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('orders')}>Orders</button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}

        {tab === 'menu' && (
          <>
            <p className="page-title" style={{ fontSize: '16px', marginBottom: '1rem' }}>
              {editingId ? 'Edit item' : 'Add new item'}
            </p>
            <div className="form-grid">
              <div className="field"><label>Name</label><input placeholder="e.g. Chicken Burger" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
              <div className="field"><label>Category</label><input placeholder="e.g. Main" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} /></div>
              <div className="field"><label>Price</label><input type="number" placeholder="0.00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} /></div>
              <div className="field"><label>Description</label><input placeholder="Short description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '2rem' }}>
              <button className="btn btn-primary" onClick={handleSubmit}>{editingId ? 'Update item' : 'Add item'}</button>
              {editingId && <button className="btn btn-ghost" onClick={() => { setForm(emptyForm); setEditingId(null); }}>Cancel edit</button>}
            </div>

            <p className="page-title" style={{ fontSize: '16px', marginBottom: '1rem' }}>Current menu</p>
            {menuItems.length === 0 && <p className="empty">No menu items yet.</p>}
            {menuItems.map(item => (
              <div key={item.id} className="staff-row">
                <div>
                  <p className="staff-row-name">{item.name}</p>
                  <p className="staff-row-meta">{item.category} · ${Number(item.price).toFixed(2)}</p>
                </div>
                <div className="staff-row-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(item)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>Delete</button>
                </div>
              </div>
            ))}
          </>
        )}

        {tab === 'orders' && (
          <>
            <p className="page-title" style={{ fontSize: '16px', marginBottom: '1rem' }}>All orders</p>
            {orders.length === 0 && <p className="empty">No orders yet.</p>}
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <span className="order-id">Order #{order.id} — {order.username}</span>
                  <span className={`badge badge-${order.status}`}>{order.status}</span>
                </div>
                <p className="order-date">{new Date(order.order_date).toLocaleString()}</p>
                {order.items.map((item, i) => (
                  <p key={i} className="order-item-row">{item.name} x{item.quantity} — ${Number(item.price).toFixed(2)}</p>
                ))}
                <div className="order-footer">
                  <span className="order-total">Total: ${Number(order.total_price).toFixed(2)}</span>
                  <select className="status-select" value={order.status} onChange={e => updateStatus(order.id, e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="ready">Ready</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}