const express = require('express');
const db = require('../db');
const { isLoggedIn, isStaff } = require('../middleware/auth');
const router = express.Router();

router.post('/orders', isLoggedIn, async (req, res) => {
  const { items } = req.body;
  const userId = req.session.user.id;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Order must have at least one item' });
  }

  try {
    let total = 0;
    const resolvedItems = [];

    for (const item of items) {
      const [rows] = await db.query(
        'SELECT * FROM menu_items WHERE id = ? AND available = true',
        [item.menu_item_id]
      );
      if (rows.length === 0) {
        return res.status(400).json({ message: `Item ${item.menu_item_id} is not available` });
      }
      const menuItem = rows[0];
      total += menuItem.price * item.quantity;
      resolvedItems.push({ ...item, price: menuItem.price });
    }

    const [orderResult] = await db.query(
      'INSERT INTO orders (user_id, total_price) VALUES (?, ?)',
      [userId, total]
    );
    const orderId = orderResult.insertId;

    for (const item of resolvedItems) {
      await db.query(
        'INSERT INTO order_items (order_id, menu_item_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.menu_item_id, item.quantity, item.price]
      );
    }

    res.status(201).json({ message: 'Order placed', orderId, total });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/my-orders', isLoggedIn, async (req, res) => {
  const userId = req.session.user.id;

  try {
    const [orders] = await db.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY order_date DESC',
      [userId]
    );

    for (const order of orders) {
      const [orderItems] = await db.query(
        `SELECT oi.quantity, oi.price, mi.name 
         FROM order_items oi 
         JOIN menu_items mi ON oi.menu_item_id = mi.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = orderItems;
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/orders', isLoggedIn, isStaff, async (req, res) => {
  try {
    const [orders] = await db.query(
      'SELECT o.*, u.username FROM orders o JOIN users u ON o.user_id = u.id ORDER BY o.order_date DESC'
    );

    for (const order of orders) {
      const [orderItems] = await db.query(
        `SELECT oi.quantity, oi.price, mi.name 
         FROM order_items oi 
         JOIN menu_items mi ON oi.menu_item_id = mi.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = orderItems;
    }

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/orders/:id/status', isLoggedIn, isStaff, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    const [result] = await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json({ message: 'Order status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/orders/:id', isLoggedIn, async (req, res) => {
  const userId = req.session.user.id;
  const role = req.session.user.role;

  try {
    const [rows] = await db.query(
      'SELECT * FROM orders WHERE id = ?',
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = rows[0];

    if (role !== 'staff' && order.user_id !== userId) {
      return res.status(403).json({ message: 'Not allowed' });
    }

    if (role !== 'staff' && order.status !== 'pending') {
      return res.status(400).json({ message: 'You can only cancel pending orders' });
    }

    await db.query('DELETE FROM order_items WHERE order_id = ?', [req.params.id]);
    await db.query('DELETE FROM orders WHERE id = ?', [req.params.id]);

    res.json({ message: 'Order cancelled' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;