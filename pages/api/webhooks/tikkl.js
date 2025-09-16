const { connectToDatabase } = require('../_lib/db');
const User = require('../_lib/User');
const Ticket = require('../_lib/Ticket');
const { generateId } = require('../_lib/utils');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const webhookData = req.body;

    // Log the incoming webhook for debugging
    console.log('📨 Tikkl Webhook received:', JSON.stringify(webhookData, null, 2));

    // Extract ticket data from Tikkl webhook payload
    // Adjust these field names based on actual Tikkl webhook format
    const {
      ticket_id,
      subject,
      description,
      status,
      priority,
      customer_email,
      customer_name,
      agent_email,
      agent_name,
      created_at,
      updated_at,
      tags = []
    } = webhookData;

    // Validate required fields
    if (!ticket_id || !customer_email) {
      console.warn('⚠️  Missing required ticket data:', { ticket_id, customer_email });
      return res.status(400).json({ error: 'Missing required ticket data' });
    }

    // Find or create user
    let user = await User.findOne({ email: customer_email });

    if (!user) {
      user = await User.create({
        name: customer_name || 'Tikkl User',
        email: customer_email,
        authProvider: 'tikkl',
        referralCode: generateId(8),
        lastLogin: new Date(),
        loginCount: 1,
      });
      console.log('✅ Created new Tikkl user:', user.email);
    }

    // Create or update ticket
    const ticketData = {
      ticketId: ticket_id.toString(),
      subject: subject || 'No Subject',
      description: description || '',
      status: status || 'open',
      priority: priority || 'normal',
      tags: Array.isArray(tags) ? tags : [],
      requester: {
        name: customer_name || 'Unknown',
        email: customer_email,
      },
      assignee: agent_email ? {
        name: agent_name || 'Agent',
        email: agent_email,
      } : null,
      createdAt: created_at ? new Date(created_at) : new Date(),
      updatedAt: updated_at ? new Date(updated_at) : new Date(),
      user: user._id, // Use 'user' field to match the verification logic
      source: 'tikkl'
    };

    // Upsert ticket
    const ticket = await Ticket.findOneAndUpdate(
      { ticketId: ticket_id.toString() },
      ticketData,
      { upsert: true, new: true }
    );

    console.log(`✅ Ticket ${ticket_id} synced from Tikkl for user ${user.email}`);
    res.status(200).json({
      success: true,
      ticketId: ticket_id,
      userId: user._id,
      message: 'Ticket synced successfully'
    });

  } catch (err) {
    console.error('❌ Tikkl webhook processing error:', err);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
};