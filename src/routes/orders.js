import express from 'express';
import { getDb } from '../utils/db.js';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authRequired, async (req, res) => {
  const { items = [], total = 0, payment_method = 'COD' } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Missing items' });
  }
  const db = await getDb();
  try {
    const result = await db.run(
      `INSERT INTO orders (user_id, items_json, total, payment_method, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [req.user.id, JSON.stringify(items), Number(total), payment_method]
    );
    const order = await db.get('SELECT * FROM orders WHERE id = ?', [result.lastID]);
    res.status(201).json(order);
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  } finally {
    await db.close();
  }
});

router.get('/', authRequired, async (req, res) => {
  const db = await getDb();
  try {
    const rows = await db.all('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    res.json(rows);
  } catch {
    res.status(500).json({ error: 'Server error' });
  } finally {
    await db.close();
  }
});

export default router;
