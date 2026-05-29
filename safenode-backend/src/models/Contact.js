/**
 * Contact.js — Emergency Contact Model
 * Each contact belongs to a user.
 * verified = true only after OTP confirmation.
 */

const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  userId: {
    type:     mongoose.Schema.Types.ObjectId,
    ref:      'User',
    required: true,
  },
  name: {
    type:     String,
    required: true,
    trim:     true,
  },
  phone: {
    type:     String,
    required: true,
    trim:     true,
  },
  verified: {
    type:    Boolean,
    default: false,
  },
  // OTP for verification — cleared after use
  otp: {
    type:    String,
    default: null,
  },
  // OTP expiry — reject if older than 5 minutes
  otpExpiry: {
    type:    Date,
    default: null,
  },
  createdAt: {
    type:    Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Contact', contactSchema);
