const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const mongoose = require('mongoose');
// Simple ID generator (avoids ESM import issues from nanoid)
function generateId(length = 10) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// MongoDB setup
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bgm_referrals';
mongoose.connect(mongoUri, { autoIndex: true }).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error', err);
  process.exit(1);
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  referralCode: { type: String, required: true, unique: true, index: true },
  referrals: { type: Number, default: 0 },
  pendingTokens: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Simple auth: email-only login for demo purposes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email } = req.body || {};
    if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
    const exists = await User.findOne({ email: email.toLowerCase() }).lean();
    if (exists) return res.status(409).json({ error: 'Email already registered' });
    const referralCode = generateId(8);
    const user = await User.create({ name, email: email.toLowerCase(), referralCode });
    res.json({ user });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Duplicate key' });
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email is required' });
  const user = await User.findOne({ email: email.toLowerCase() }).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// Redirect to Tikkl with ref param, and set a short-lived cookie to attribute on success callback
const TIKKL_EVENT_URL = 'https://tikkl.com/bgm/c/bgm26-hyd';

app.get('/api/ref/:code', async (req, res) => {
  const { code } = req.params;
  const owner = await User.findOne({ referralCode: code });
  if (!owner) return res.status(404).send('Invalid referral');
  // For simplicity, we record a pending referral mapped by a token
  const token = generateId(12);
  // Save token on user for later validation; keep a small list
  owner.pendingTokens.push(token);
  await owner.save();
  // Redirect to Tikkl with referral token so we get it back on success
  const redirectUrl = `${TIKKL_EVENT_URL}?ref=${encodeURIComponent(code)}&token=${encodeURIComponent(token)}`;
  res.redirect(302, redirectUrl);
});

// This endpoint should be called by our front-end after Tikkl registration success.
// In real-world, use a webhook or return URL from Tikkl. Here we simulate by expecting the token back.
app.post('/api/ref/success', async (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: 'token required' });
  const owner = await User.findOne({ pendingTokens: token });
  if (!owner) return res.status(404).json({ error: 'Invalid token' });
  owner.pendingTokens = owner.pendingTokens.filter(t => t !== token);
  owner.referrals = (owner.referrals || 0) + 1;
  await owner.save();
  res.json({ ok: true, referrals: owner.referrals || 0 });
});

app.get('/api/leaderboard', async (req, res) => {
  const users = await User.find({}).sort({ referrals: -1 }).limit(100).lean();
  const top = users.map(u => ({ name: u.name, email: u.email, referrals: u.referrals || 0, referralCode: u.referralCode }));
  res.json({ leaderboard: top });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});


