/**
 * sos.js — SOS Alert Routes
 * POST /api/sos
 * GET  /api/sos/:id/status
 * POST /api/sos/:id/respond
 */

const express   = require('express');
const twilio    = require('twilio');
const rateLimit = require('express-rate-limit');
const Alert     = require('../models/Alert');
const Contact   = require('../models/Contact');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require login
router.use(protect);

// ── Rate limiter: max 5 SOS triggers per 15 min per user ──────
// Prevents Twilio credit abuse from accidental or malicious spam
const sosLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: 'Too many SOS alerts sent. Please wait before trying again.' },
});

// ── POST /api/sos ─────────────────────────────────────────────
router.post('/', sosLimiter, async (req, res) => {
  const { lat, lng } = req.body;

  // Validate coordinates are real numbers in valid range
  const latNum = parseFloat(lat);
  const lngNum = parseFloat(lng);

  if (isNaN(latNum) || isNaN(lngNum))
    return res.status(400).json({ message: 'Valid location (lat, lng) is required' });

  if (latNum < -90 || latNum > 90 || lngNum < -180 || lngNum > 180)
    return res.status(400).json({ message: 'Location coordinates are out of range' });

  try {
    const contacts = await Contact.find({
      userId:   req.user._id,
      verified: true,
    });

    if (contacts.length === 0)
      return res.status(400).json({ message: 'No verified contacts found. Add and verify contacts first.' });

    const mapsUrl = `https://maps.google.com/?q=${latNum},${lngNum}`;

    // Build identity block — includes user details in the WhatsApp alert
    // so receivers know who sent it even if they don't have the number saved
    const identity = req.body.identity || req.user.identity || {};
    const identityLines = [
      `👤 *Name:* ${identity.fullName || req.user.displayName}`,
      identity.age        ? `🎂 *Age:* ${identity.age}`                : null,
      identity.bloodGroup ? `🩸 *Blood Group:* ${identity.bloodGroup}` : null,
      identity.address    ? `🏠 *Address:* ${identity.address}`        : null,
      identity.note       ? `📋 *Note:* ${identity.note}`              : null,
    ].filter(Boolean).join('\n');

    const message = `🚨 *EMERGENCY ALERT*\n\n${identityLines}\n\n📍 *Live Location:*\n${mapsUrl}\n\n_Sent via SafeNode Safety App_`;

    const alert = await Alert.create({
      userId:   req.user._id,
      location: { lat: latNum, lng: lngNum, mapsUrl },
      contacts: contacts.map((c) => ({
        contactId: c._id,
        name:      c.name,
        phone:     c.phone,
        status:    'pending',
      })),
    });

    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );

    const sendPromises = contacts.map((contact) =>
      twilioClient.messages
        .create({
          from: process.env.TWILIO_WHATSAPP_FROM,
          to:   `whatsapp:${contact.phone}`,
          body: message,
        })
        // Log contact ID only — never log phone numbers in production
        .then(() => console.log(`[SOS] Message sent to contact ID: ${contact._id}`))
        .catch((err) => console.error(`[SOS] Failed for contact ID ${contact._id}:`, err.message))
    );

    await Promise.allSettled(sendPromises);

    res.status(201).json({
      message:   'SOS alert sent successfully',
      alertId:   alert._id,
      contacted: contacts.length,
    });
  } catch (err) {
    console.error('[SOS] Trigger error:', err.message);
    res.status(500).json({ message: 'Failed to send SOS alert. Please try again.' });
  }
});

// ── GET /api/sos/:id/status ───────────────────────────────────
router.get('/:id/status', async (req, res) => {
  try {
    // Ownership check: only the alert owner can see its status
    const alert = await Alert.findOne({
      _id:    req.params.id,
      userId: req.user._id,
    });

    if (!alert)
      return res.status(404).json({ message: 'Alert not found' });

    const pending   = alert.contacts.filter((c) => c.status === 'pending').length;
    const responded = alert.contacts.filter((c) => c.status === 'responded').length;

    res.json({
      alertId:   alert._id,
      total:     alert.contacts.length,
      pending,
      responded,
    });
  } catch (err) {
    console.error('[SOS] Status error:', err.message);
    res.status(500).json({ message: 'Failed to fetch alert status.' });
  }
});

// ── POST /api/sos/:id/respond ─────────────────────────────────
// Called when a contact responds (future: Twilio webhook)
// Ownership check: verify the alert belongs to the requesting user
router.post('/:id/respond', async (req, res) => {
  const { contactPhone } = req.body;

  if (!contactPhone)
    return res.status(400).json({ message: 'contactPhone is required' });

  try {
    // Ownership check — only the alert owner's contacts can be updated
    const alert = await Alert.findOne({
      _id:    req.params.id,
      userId: req.user._id,
    });

    if (!alert)
      return res.status(404).json({ message: 'Alert not found' });

    const contact = alert.contacts.find((c) => c.phone === contactPhone);
    if (!contact)
      return res.status(404).json({ message: 'Contact not found in this alert' });

    contact.status      = 'responded';
    contact.respondedAt = new Date();
    await alert.save();

    res.json({ message: 'Response recorded' });
  } catch (err) {
    console.error('[SOS] Respond error:', err.message);
    res.status(500).json({ message: 'Failed to record response.' });
  }
});

module.exports = router;
