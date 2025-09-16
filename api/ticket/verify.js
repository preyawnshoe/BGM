const { connectToDatabase } = require('../_lib/db');
const Ticket = require('../_lib/Ticket');
const User = require('../_lib/User');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const { ticketId, userId, referralCode } = req.body;

    if (!ticketId || !userId) {
      return res.status(400).json({ error: 'ticketId and userId are required' });
    }

    // Check if ticket exists and is not used
    const ticket = await Ticket.findOne({ ticketId: ticketId.trim() });

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket not found. Please check your ticket ID.' });
    }

    if (ticket.used) {
      return res.status(400).json({ error: 'This ticket has already been used.' });
    }

    if (ticket.user && ticket.user.toString() !== userId) {
      return res.status(400).json({ error: 'This ticket is already associated with another user.' });
    }

    // Check if user already has a ticket
    const existingTicket = await Ticket.findOne({ user: userId });
    if (existingTicket) {
      return res.status(400).json({ error: 'You already have a ticket associated with your account.' });
    }

    // Associate ticket with user
    ticket.user = userId;
    ticket.used = true;
    await ticket.save();

    // Handle referral code if provided
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer && referrer._id.toString() !== userId) {
        referrer.referrals = (referrer.referrals || 0) + 1;
        await referrer.save();
        console.log(`Referral count incremented for user ${referrer._id}`);
      }
    }

    console.log(`Ticket ${ticketId} successfully associated with user ${userId}`);
    res.json({
      success: true,
      message: 'Ticket verified and associated with your account!',
      ticketId: ticket.ticketId
    });

  } catch (err) {
    console.error('Ticket verification error:', err);
    res.status(500).json({ error: 'Failed to verify ticket. Please try again.' });
  }
};