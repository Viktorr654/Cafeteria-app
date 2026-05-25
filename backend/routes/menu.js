const express = require('express');
const db = require('../db');
const { isLoggedIn, isStaff } = require('../middleware/auth');
const router = express.Router();

router.get('/menu', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM menu_items WHERE available = true'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/menu/:id', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM menu_items WHERE id = ?',
      [req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/menu', isLoggedIn, isStaff, async (req, res) => {
  const { name, category, price, description } = req.body;

  if (!name || !category || !price) {
    return res.status(400).json({ message: 'Name, category and price are required' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO menu_items (name, category, price, description) VALUES (?, ?, ?, ?)',
      [name, category, price, description || null]
    );
    res.status(201).json({ message: 'Menu item created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/menu/:id', isLoggedIn, isStaff, async (req, res) => {
  const { name, category, price, description, available } = req.body;

  try {
    const [result] = await db.query(
      'UPDATE menu_items SET name = ?, category = ?, price = ?, description = ?, available = ? WHERE id = ?',
      [name, category, price, description, available, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Menu item updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/menu/:id', isLoggedIn, isStaff, async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM menu_items WHERE id = ?',
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;