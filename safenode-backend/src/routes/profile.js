/**
 * profile.js — User Profile Routes
 *
 * GET  /api/profile          — get current user's profile + identity
 * PUT  /api/profile          — update display name / email
 * PUT  /api/profile/identity — save identity details (name, age, blood group, etc.)
 *
 * All routes require JWT auth.
 * Identity fields are stored as plain text (not hashed) because they need
 * to be readable for SOS alerts. Only the password is hashed.
 */

const express  = require('express');
const User     = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require login
router.use(protect);

// ── GET /api/profile ──────────────────────────────────────────
// Returns the logged-in user's full profile
router.get('/', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      id:          user._id,
      phone:       user.phone,
      displayName: user.displayName,
      email:       user.email,
      identity:    user.identity,
      createdAt:   user.createdAt,
    });
  } catch (err) {
    console.error('[PROFILE] Get error:', err.message);
    res.status(500).json({ message: 'Failed to fetch profile.' });
  }
});

// ── PUT /api/profile ──────────────────────────────────────────
// Update display name and/or email
router.put('/', async (req, res) => {
  const { displayName, email } = req.body;

  if (displayName && displayName.length > 100)
    return res.status(400).json({ message: 'Display name too long' });

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (displayName) user.displayName = displayName.trim();
    if (email)       user.email       = email.trim();

    await user.save();

    res.json({
      id:          user._id,
      phone:       user.phone,
      displayName: user.displayName,
      email:       user.email,
    });
  } catch (err) {
    console.error('[PROFILE] Update error:', err.message);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

// ── PUT /api/profile/identity ─────────────────────────────────
// Save identity details from Register screen or Profile edit
// These are included in every SOS WhatsApp alert
router.put('/identity', async (req, res) => {
  const { fullName, age, bloodGroup, address, note } = req.body;

  // Basic validation
  if (fullName   && fullName.length   > 100) return res.status(400).json({ message: 'Name too long' });
  if (address    && address.length    > 300) return res.status(400).json({ message: 'Address too long' });
  if (note       && note.length       > 500) return res.status(400).json({ message: 'Note too long' });
  if (age        && isNaN(Number(age)))      return res.status(400).json({ message: 'Invalid age' });
  if (bloodGroup && !['A+','A-','A−','B+','B-','B−','AB+','AB-','AB−','O+','O-','O−','Unknown'].includes(bloodGroup))
    return res.status(400).json({ message: 'Invalid blood group' });

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Only update fields that were provided
    if (fullName   !== undefined) user.identity.fullName   = fullName.trim();
    if (age        !== undefined) user.identity.age        = age.toString().trim();
    if (bloodGroup !== undefined) user.identity.bloodGroup = bloodGroup;
    if (address    !== undefined) user.identity.address    = address.trim();
    if (note       !== undefined) user.identity.note       = note.trim();

    await user.save();

    res.json({
      message:  'Identity saved successfully',
      identity: user.identity,
    });
  } catch (err) {
    console.error('[PROFILE] Identity update error:', err.message);
    res.status(500).json({ message: 'Failed to save identity.' });
  }
});

module.exports = router;
