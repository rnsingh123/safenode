/**
 * index.js — SafeNode API Entry Point
 * Starts the Express server and connects to MongoDB.
 */

require('dotenv').config();

// ── Security: fail fast if critical env vars are missing ──────
if (!process.env.JWT_SECRET) {
  console.error('[FATAL] JWT_SECRET is not set. Refusing to start.');
  process.exit(1);
}
if (!process.env.MONGO_URI) {
  console.error('[FATAL] MONGO_URI is not set. Refusing to start.');
  process.exit(1);
}

const express    = require('express');
const cors       = require('cors');
const mongoose   = require('mongoose');
const rateLimit  = require('express-rate-limit');

const authRoutes    = require('./routes/auth');
const contactRoutes = require('./routes/contacts');
const sosRoutes     = require('./routes/sos');
const profileRoutes = require('./routes/profile');
const { initFirebase } = require('./config/firebase');

// Initialize Firebase Admin SDK (for OTP token verification)
initFirebase();

const app  = express();
const PORT = process.env.PORT || 5000;

// Trust proxy — required when running behind Render/Railway/Heroku
// This fixes express-rate-limit X-Forwarded-For error
app.set('trust proxy', 1);

// ── CORS — only allow your app's origin ──────────────────────
// In development: allow localhost. In production: set APP_ORIGIN env var.
const allowedOrigin = process.env.APP_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: allowedOrigin }));

// ── Body parser — limit payload size to prevent abuse ─────────
app.use(express.json({ limit: '10kb' }));

// ── Global rate limiter — 100 requests per 15 min per IP ──────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { message: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/sos',      sosRoutes);
app.use('/api/profile',  profileRoutes);

// ── Health check ──────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'SafeNode API is running', version: '1.0.0' });
});

// ── Global error handler — never expose raw errors ───────────
app.use((err, req, res, _next) => {
  console.error('[ERROR]', err.message);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

// ── Connect MongoDB → Start server ───────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('[DB] MongoDB connected');
    app.listen(PORT, () => {
      console.log(`[SERVER] Running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[DB] Connection failed:', err.message);
    process.exit(1);
  });
