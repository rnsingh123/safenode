/**
 * Alert.js — SOS Alert Model
 * Created every time a user triggers SOS.
 * Tracks which contacts received the alert and who responded.
 */

const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  userId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  // GPS coordinates at time of SOS
  location: {
    lat:     { type: Number, required: true },
    lng:     { type: Number, required: true },
    mapsUrl: { type: String }, // Google Maps link
  },
  // One entry per contact notified
  contacts: [
    {
      contactId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
      name:        { type: String },
      phone:       { type: String },
      // pending   = alert sent, no reply yet
      // responded = contact acknowledged
      status:      { type: String, enum: ['pending', 'responded'], default: 'pending' },
      sentAt:      { type: Date, default: Date.now },
      respondedAt: { type: Date, default: null },
    },
  ],
  createdAt: {
    type:    Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Alert', alertSchema);
