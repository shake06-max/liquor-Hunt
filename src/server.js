import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import cartRouter from './routes/cart.js';
import ordersRouter from './routes/orders.js';
import paymentsRouter from './routes/payments.js';
import { ensureDb } from './utils/db.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Prepare DB (creates file and tables if missing)
await ensureDb();

app.get('/', (req, res) => {
  res.json({ ok: true, name: 'Liquor Hunt API' });
});

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);

// Contacts endpoint (for frontend footer/about)
app.get('/api/contacts', (req, res) => {
  res.json({
    name: 'Liquor Hunt',
    phone: process.env.CONTACT_PHONE || '+254700000000',
    email: process.env.CONTACT_EMAIL || 'info@example.com',
    address: process.env.CONTACT_ADDRESS || 'Nairobi, Kenya'
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Liquor Hunt API running on http://localhost:${PORT}`);
});
