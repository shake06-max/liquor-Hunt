import express from 'express';
const router = express.Router();

// Placeholder endpoints for future M‑Pesa Daraja integration
router.post('/mpesa', async (req, res) => {
  // TODO: integrate Daraja. For now, just respond ok.
  res.json({ ok: true, message: 'M‑Pesa payment placeholder received.' });
});

export default router;
