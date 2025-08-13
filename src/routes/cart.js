import express from 'express';
import { authRequired } from '../middleware/auth.js';

const router = express.Router();

// Simple sessionless cart endpoints (frontend maintains cart; server validates at checkout)
router.post('/validate', async (req, res) => {
  const { items = [] } = req.body;
  // Basic validation
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }
  // Here you could check stock levels etc. For demo, we accept any positive quantity.
  res.json({ ok: true });
});

export default router;
