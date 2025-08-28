const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  referralCode: { type: String, required: true, unique: true, index: true },
  referrals: { type: Number, default: 0 },
  pendingTokens: { type: [String], default: [] },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema); 