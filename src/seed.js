import dotenv from 'dotenv';
import { getDb, ensureDb } from './utils/db.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const demoProducts = [
  { name: 'Johnnie Walker Black Label 1L', brand: 'Johnnie Walker', category: 'Whisky', price: 4500, image: '/images/jw-black.jpg', description: 'Aged 12 years, smooth and smoky.', stock: 25 },
  { name: 'Jameson Irish Whiskey 750ml', brand: 'Jameson', category: 'Whisky', price: 3200, image: '/images/jameson.jpg', description: 'Triple distilled, twice as smooth.', stock: 30 },
  { name: 'Bacardi Superior 750ml', brand: 'Bacardi', category: 'Rum', price: 2100, image: '/images/bacardi.jpg', description: 'Classic white rum, perfect for cocktails.', stock: 20 },
  { name: 'Absolut Vodka 1L', brand: 'Absolut', category: 'Vodka', price: 2500, image: '/images/absolut.jpg', description: 'Clean, crisp Swedish vodka.', stock: 15 },
  { name: 'Four Cousins Sweet Red 750ml', brand: 'Four Cousins', category: 'Wine', price: 1200, image: '/images/four-cousins.jpg', description: 'Sweet red wine with fruity notes.', stock: 40 },
];

async function run() {
  await ensureDb();
  const db = await getDb();
  // seed admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@liquorhunt.ke';
  const adminPass = process.env.ADMIN_PASSWORD || 'admin123';
  const hash = await bcrypt.hash(adminPass, 10);
  await db.run(
    `INSERT OR IGNORE INTO users (name, email, password_hash, is_admin)
     VALUES ('Admin', ?, ?, 1)`, [adminEmail, hash]
  );
  // seed products
  for (const p of demoProducts) {
    await db.run(
      `INSERT INTO products (name, brand, category, price, image, description, stock)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [p.name, p.brand, p.category, p.price, p.image, p.description, p.stock]
    );
  }
  await db.close();
  console.log('Seeded admin and demo products.');
}
run().catch(console.error);
