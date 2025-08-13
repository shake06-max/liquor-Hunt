import express from 'express';
import { getDb } from '../utils/db.js';
import { authRequired, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { q = '', category = '', brand = '', min = 0, max = 999999 } = req.query;
  const db = await getDb();
  try {
    const items = await db.all(
      `SELECT * FROM products
       WHERE name LIKE ? AND category LIKE ? AND brand LIKE ? AND price BETWEEN ? AND ?
       ORDER BY created_at DESC`,
      [`%${q}%`, `%${category}%`, `%${brand}%`, Number(min), Number(max)]
    );
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  } finally {
    await db.close();
  }
});

router.get('/:id', async (req, res) => {
  const db = await getDb();
  try {
    const item = await db.get('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch {
    res.status(500).json({ error: 'Server error' });
  } finally {
    await db.close();
  }
});

router.post('/', authRequired, adminOnly, async (req, res) => {
  const { name, brand, category, price, image, description, stock } = req.body;
  const db = await getDb();
  try {
    const result = await db.run(
      `INSERT INTO products (name, brand, category, price, image, description, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, brand, category, Number(price), image, description, Number(stock || 0)]
    );
    const created = await db.get('SELECT * FROM products WHERE id = ?', [result.lastID]);
    res.status(201).json(created);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  } finally {
    await db.close();
  }
});

export default router;
