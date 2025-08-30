const router = require('express').Router();
const Ticket = require('../models/Ticket');

// GET /api/ticket/user/:userId
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  const ticket = await Ticket.findOne({ user: userId });
  if (!ticket) return res.json({ hasTicket: false });
  return res.json({ hasTicket: true, ticketId: ticket.ticketId });
});

module.exports = router;
