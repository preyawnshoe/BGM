const mongoose = require('mongoose');

let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
    const masked = uri ? uri.replace(/(\/\/)([^:@]+):([^@]+)@/, '$1****:****@') : '(undefined)';
    console.log('[DB] Using Mongo URI:', masked);
    if (!uri) throw new Error('Missing MONGO_URI/MONGODB_URI');
    cached.promise = mongoose.connect(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      directConnection: uri.includes('127.0.0.1') || uri.includes('localhost') ? true : undefined,
    }).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Inline Ticket model
const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true, index: true },
  used: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  subject: { type: String },
  description: { type: String },
  status: { type: String },
  priority: { type: String },
  tags: [{ type: String }],
  requester: {
    id: Number,
    name: String,
    email: String,
  },
  assignee: {
    id: Number,
    name: String,
    email: String,
  },
  source: { type: String, default: 'manual' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

// Inline User model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String },
  googleId: { type: String },
  referralCode: { type: String, unique: true, index: true },
  referrals: { type: Number, default: 0 },
  pendingTokens: [{ type: String }],
  referredBy: { type: String },
  isAdmin: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  loginCount: { type: Number, default: 0 },
  lastLogin: { type: Date },
  authProvider: { type: String, default: 'local' },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

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