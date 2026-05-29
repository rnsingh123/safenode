/**
 * User.js — User Model
 * Stores registered users. Passwords are hashed before saving.
 */

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema({
  phone: {
    type:     String,
    required: true,
    unique:   true,
    trim:     true,
  },
  password: {
    type:      String,
    required:  true,
    minlength: 6,
  },
  displayName: {
    type:    String,
    default: '',
  },
  email: {
    type:    String,
    default: '',
  },
  // Firebase UID — set when user logs in via Firebase Phone Auth
  firebaseUid: {
    type:    String,
    default: null,
    index:   true,
  },
  // Identity details from Register screen — included in SOS alerts
  identity: {
    fullName:   { type: String, default: '' },
    age:        { type: String, default: '' },
    bloodGroup: { type: String, default: '' },
    address:    { type: String, default: '' },
    note:       { type: String, default: '' },
  },
  createdAt: {
    type:    Date,
    default: Date.now,
  },
});

// Hash password before saving to DB
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare plain password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
