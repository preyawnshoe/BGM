
const router = require('express').Router();

// GET /api/ticket/user/:userId - check if user has a verified ticket
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const ticket = await Ticket.findOne({ user: userId, used: true });
  res.json({ hasTicket: !!ticket });
});

const User = require('../models/User');
const Ticket = require('../models/Ticket');


// POST /api/ticket/verify { ticketId, userId }
router.post('/verify', async (req, res) => {
  const { ticketId, userId } = req.body || {};
  if (!ticketId) return res.status(400).json({ error: 'ticketId required' });
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const ticket = await Ticket.findOne({ ticketId: ticketId.trim() });
  if (!ticket) return res.status(404).json({ error: 'Invalid Ticket ID' });
  if (ticket.used) return res.status(409).json({ error: 'Ticket already used' });

  // Mark ticket as used and associate with user
  ticket.used = true;
  ticket.user = userId;
  await ticket.save();

  // Find the user and increment the referrer's count if referredBy is set
  const user = await User.findById(userId);
  if (user && user.referredBy) {
    const referrer = await User.findOne({ referralCode: user.referredBy });
    if (referrer) {
      referrer.referrals = (referrer.referrals || 0) + 1;
      await referrer.save();
    }
  }

  return res.json({ ok: true });
});

module.exports = router;
