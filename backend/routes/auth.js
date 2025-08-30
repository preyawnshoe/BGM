const router = require('express').Router();
const User = require('../models/User');
const { generateId } = require('../utils/id');

router.post('/register', async (req, res) => {
  try {
    const { name, email, referralCode } = req.body || {};
    if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
    const exists = await User.findOne({ email: email.toLowerCase() }).lean();
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const newReferralCode = generateId(8);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      referralCode: newReferralCode,
      referredBy: referralCode || null
    });
    // Do NOT increment referrer count here. Only increment on ticket verification.
    res.json({ user });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'Duplicate key' });
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'email is required' });
  const user = await User.findOne({ email: email.toLowerCase() }).lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

router.get('/user/:referralCode', async (req, res) => {
  try {
    const { referralCode } = req.params;
    const user = await User.findOne({ referralCode }).select('name email').lean();
    if (!user) return res.status(404).json({ error: 'Referral code not found' });
    res.json({ user });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;