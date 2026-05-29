/**
 * contacts.js — Emergency Contact Routes
 * GET    /api/contacts
 * POST   /api/contacts
 * POST   /api/contacts/verify
 * DELETE /api/contacts/:id
 */

const express   = require('express');
const rateLimit = require('express-rate-limit');
const Contact   = require('../models/Contact');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require login
router.use(protect);

// ── Rate limiter: max 20 contact operations per 15 min ────────
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many requests. Please try again later.' },
});

// ── Phone number format validator ─────────────────────────────
const isValidPhone = (phone) => /^\+?[\d\s\-]{10,15}$/.test(phone.trim());

// ── GET /api/contacts ─────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    // Never return the OTP field to the client
    const contacts = await Contact.find({ userId: req.user._id }).select('-otp -otpExpiry');
    res.json(contacts);
  } catch (err) {
    console.error('[CONTACTS] Get error:', err.message);
    res.status(500).json({ message: 'Failed to fetch contacts.' });
  }
});

// ── POST /api/contacts ────────────────────────────────────────
router.post('/', contactLimiter, async (req, res) => {
  const { name, phone } = req.body;

  // Input validation
  if (!name || !phone)
    return res.status(400).json({ message: 'Name and phone are required' });

  if (name.trim().length > 100)
    return res.status(400).json({ message: 'Name is too long' });

  if (!isValidPhone(phone))
    return res.status(400).json({ message: 'Invalid phone number format' });

  try {
    // Generate 6-digit OTP
    const otp       = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // expires in 5 minutes

    const contact = await Contact.create({
      userId:    req.user._id,
      name:      name.trim(),
      phone:     phone.trim(),
      verified:  false,
      otp,
      otpExpiry,
    });

    // TODO: Send real OTP via Twilio WhatsApp
    // Never log the OTP value in production
    console.log(`[OTP] Code generated for contact ID: ${contact._id}`);

    res.status(201).json({
      message: 'Contact added. OTP sent for verification.',
      contact: {
        id:       contact._id,
        name:     contact.name,
        phone:    contact.phone,
        verified: contact.verified,
      },
    });
  } catch (err) {
    console.error('[CONTACTS] Add error:', err.message);
    res.status(500).json({ message: 'Failed to add contact.' });
  }
});

// ── POST /api/contacts/verify ─────────────────────────────────
router.post('/verify', contactLimiter, async (req, res) => {
  const { contactId, otp } = req.body;

  if (!contactId || !otp)
    return res.status(400).json({ message: 'contactId and otp are required' });

  if (typeof otp !== 'string' || otp.length !== 6)
    return res.status(400).json({ message: 'Invalid OTP format' });

  try {
    const contact = await Contact.findOne({
      _id:    contactId,
      userId: req.user._id,
    });

    if (!contact)
      return res.status(404).json({ message: 'Contact not found' });

    // Check OTP expiry (5 minute window)
    if (!contact.otpExpiry || new Date() > contact.otpExpiry)
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });

    if (contact.otp !== otp)
      return res.status(400).json({ message: 'Wrong OTP. Try again.' });

    // Clear OTP after successful verification
    contact.verified  = true;
    contact.otp       = null;
    contact.otpExpiry = null;
    await contact.save();

    res.json({
      message: 'Contact verified successfully',
      contact: {
        id:       contact._id,
        name:     contact.name,
        phone:    contact.phone,
        verified: contact.verified,
      },
    });
  } catch (err) {
    console.error('[CONTACTS] Verify error:', err.message);
    res.status(500).json({ message: 'Verification failed.' });
  }
});

// ── DELETE /api/contacts/:id ──────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user._id, // ensures user can only delete their own contacts
    });

    if (!contact)
      return res.status(404).json({ message: 'Contact not found' });

    res.json({ message: 'Contact removed' });
  } catch (err) {
    console.error('[CONTACTS] Delete error:', err.message);
    res.status(500).json({ message: 'Failed to remove contact.' });
  }
});

module.exports = router;
