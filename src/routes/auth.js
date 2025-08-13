import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../utils/db.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  const db = await getDb();
  try {
    const hash = await bcrypt.hash(password, 10);
    await db.run(
      'INSERT INTO users (name, email, password_hash, is_admin) VALUES (?, ?, ?, 0)',
      [name, email.toLowerCase(), hash]
    );
    const user = await db.get('SELECT id, name, email, is_admin FROM users WHERE email = ?', [email.toLowerCase()]);
    const token = jwt.sign(user, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user });
  } catch (e) {
    if (e && (e.code === 'SQLITE_CONSTRAINT' || e.message.includes('UNIQUE'))) {
      return res.status(409).json({ error: 'Email already in use' });
    }
    res.status(500).json({ error: 'Server error' });
  } finally {
    await db.close();
  }
});

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  const db = await getDb();
  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const payload = { id: user.id, name: user.name, email: user.email, is_admin: !!user.is_admin };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: payload });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  } finally {
    await db.close();
  }
});

export default router;
