const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

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

// Inline auth functions
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await connectToDatabase();

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Find user by ID from token
    const user = await User.findById(decoded.sub);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return user without password
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      referralCode: user.referralCode,
      referrals: user.referrals,
      referredBy: user.referredBy,
      isAdmin: user.isAdmin,
      lastLogin: user.lastLogin,
      loginCount: user.loginCount,
      authProvider: user.authProvider
    };

    return res.status(200).json({ user: userResponse });
  } catch (e) {
    console.error('Get user error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
};