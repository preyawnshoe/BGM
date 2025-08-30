const router = require('express').Router();
const User = require('../models/User');
const { generateId } = require('../utils/id');

const TIKKL_EVENT_URL = 'https://tikkl.com/bgm/c/bgm26-hyd';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

router.get('/:code', async (req, res) => {
  const { code } = req.params;
  const owner = await User.findOne({ referralCode: code });
  if (!owner) return res.status(404).send('Invalid referral');
  
  // Redirect to frontend signup page with referral code
  const signupUrl = `${FRONTEND_URL}/signup?ref=${encodeURIComponent(code)}`;
  res.redirect(302, signupUrl);
});

router.post('/success', async (req, res) => {
  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: 'token required' });
  const owner = await User.findOne({ pendingTokens: token });
  if (!owner) return res.status(404).json({ error: 'Invalid token' });
  owner.pendingTokens = owner.pendingTokens.filter(t => t !== token);
  await owner.save();
  res.json({ ok: true });
});

module.exports = router;