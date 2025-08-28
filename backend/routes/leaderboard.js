const router = require('express').Router();
const User = require('../models/User');

router.get('/', async (_req, res) => {
  const users = await User.find({}).sort({ referrals: -1 }).limit(100).lean();
  const top = users.map(u => ({ name: u.name, email: u.email, referrals: u.referrals || 0, referralCode: u.referralCode }));
  res.json({ leaderboard: top });
});

module.exports = router;