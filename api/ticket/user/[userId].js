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
  type: { type: String },
  tags: [{ type: String }],
  requester: {
    id: String,
    name: String,
    email: String,
  },
  assignee: {
    id: String,
    name: String,
    email: String,
  },
  source: { type: String, default: 'manual' },
  rawData: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    // In Vercel dynamic routes, the parameter is available in req.query
    const userId = req.query.userId;

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