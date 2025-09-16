const { connectToDatabase } = require('../_lib/db');
const Ticket = require('../_lib/Ticket');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }

    // Find ticket for this user
    const ticket = await Ticket.findOne({ user: userId });

    if (!ticket) {
      return res.json({ hasTicket: false });
    }

    return res.json({
      hasTicket: true,
      ticketId: ticket.ticketId,
      used: ticket.used
    });

  } catch (err) {
    console.error('Ticket verification error:', err);
    return res.status(500).json({ error: 'Failed to verify ticket' });
  }
};