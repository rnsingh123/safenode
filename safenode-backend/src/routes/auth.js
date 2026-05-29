/**
 * auth.js — Authentication Routes
 *
 * Two auth modes:
 *
 * MODE 1 — Firebase Phone OTP (primary)
 *   POST /api/auth/firebase
 *   Client sends Firebase idToken after phone OTP verification.
 *   Express verifies it with Firebase Admin SDK, then issues its own JWT.
 *
 * MODE 2 — Password login (fallback)
 *   POST /api/auth/register
 *   POST /api/auth/login
 *   Traditional phone + password auth (kept for testing/fallback).
 */

const express   = require('express');
const jwt       = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User      = require('../models/User');
const { verifyFirebaseToken } = require('../config/firebase');

const router = express.Router();

// ── Rate limiter ──────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Too many attempts. Please wait 15 minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Helpers ───────────────────────────────────────────────────
const isValidPhone = (phone) => /^\+?[\d\s\-]{10,15}$/.test(phone.trim());

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const userResponse = (user, token) => ({
  token,
  user: {
    id:          user._id,
    phone:       user.phone,
    displayName: user.displayName,
    email:       user.email,
  },
});

// ══════════════════════════════════════════════════════════════
// MODE 1 — Firebase Phone OTP
// POST /api/auth/firebase
// ══════════════════════════════════════════════════════════════
/**
 * Flow:
 *  1. React app uses Firebase SDK to send OTP to phone
 *  2. User enters OTP → Firebase verifies → returns idToken
 *  3. React app sends idToken to this endpoint
 *  4. Express verifies idToken with Firebase Admin SDK
 *  5. Creates or finds user in MongoDB
 *  6. Returns our own JWT for subsequent API calls
 */
router.post('/firebase', authLimiter, async (req, res) => {
  const { idToken, displayName, identity } = req.body;

  if (!idToken)
    return res.status(400).json({ message: 'Firebase idToken is required' });

  try {
    // Verify the Firebase token
    const decoded = await verifyFirebaseToken(idToken);

    // Firebase phone auth stores phone in decoded.phone_number
    const phone = decoded.phone_number;
    if (!phone)
      return res.status(400).json({ message: 'Phone number not found in token' });

    // Find existing user or create new one
    let user = await User.findOne({ phone });

    if (!user) {
      // First time login — create user
      user = await User.create({
        phone,
        // No password needed — Firebase handles auth
        password:    `firebase_${decoded.uid}`, // placeholder, never used for login
        displayName: displayName?.trim() || `User ${phone.slice(-4)}`,
        email:       `user${phone.slice(-4)}@safenode.app`,
        firebaseUid: decoded.uid,
        // Store identity details if provided from Register screen
        identity:    identity || null,
      });
      console.log('[AUTH] New user created via Firebase:', phone);
    } else {
      // Update identity if provided
      if (identity) {
        user.identity = identity;
        await user.save();
      }
      console.log('[AUTH] Existing user logged in via Firebase:', phone);
    }

    res.json(userResponse(user, generateToken(user._id)));

  } catch (err) {
    console.error('[AUTH] Firebase verify error:', err.message);

    if (err.code === 'auth/id-token-expired')
      return res.status(401).json({ message: 'Session expired. Please sign in again.' });
    if (err.code === 'auth/argument-error')
      return res.status(401).json({ message: 'Invalid token. Please sign in again.' });
    if (err.message === 'Firebase not initialized')
      return res.status(503).json({ message: 'Firebase auth not configured on server.' });

    res.status(500).json({ message: 'Authentication failed. Please try again.' });
  }
});

// ══════════════════════════════════════════════════════════════
// MODE 2 — Password login (fallback / testing)
// POST /api/auth/register
// POST /api/auth/login
// ══════════════════════════════════════════════════════════════

router.post('/register', authLimiter, async (req, res) => {
  const { phone, password, displayName, identity } = req.body;

  if (!phone || !password)
    return res.status(400).json({ message: 'Phone and password are required' });
  if (!isValidPhone(phone))
    return res.status(400).json({ message: 'Invalid phone number format' });
  if (password.length < 6)
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  if (password.length > 128)
    return res.status(400).json({ message: 'Password too long' });
  if (displayName && displayName.length > 100)
    return res.status(400).json({ message: 'Display name too long' });

  try {
    const exists = await User.findOne({ phone: phone.trim() });
    if (exists)
      return res.status(400).json({ message: 'Phone number already registered' });

    const user = await User.create({
      phone:       phone.trim(),
      password,
      displayName: displayName?.trim() || `User ${phone.slice(-4)}`,
      email:       `user${phone.slice(-4)}@safenode.app`,
      identity:    identity || null,
    });

    res.status(201).json(userResponse(user, generateToken(user._id)));
  } catch (err) {
    console.error('[AUTH] Register error:', err.message);
    res.status(500).json({ message: 'Registration failed. Please try again.' });
  }
});

router.post('/login', authLimiter, async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password)
    return res.status(400).json({ message: 'Phone and password are required' });
  if (!isValidPhone(phone))
    return res.status(400).json({ message: 'Invalid phone number format' });
  if (password.length > 128)
    return res.status(400).json({ message: 'Invalid credentials' });

  try {
    const user = await User.findOne({ phone: phone.trim() });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid phone number or password' });

    res.json(userResponse(user, generateToken(user._id)));
  } catch (err) {
    console.error('[AUTH] Login error:', err.message);
    res.status(500).json({ message: 'Login failed. Please try again.' });
  }
});

module.exports = router;
