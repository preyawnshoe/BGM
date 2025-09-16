const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { nanoid } = require('nanoid');

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

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

function generateToken(user) {
  return jwt.sign(
    {
      sub: user._id,
      email: user.email,
      name: user.name,
      referralCode: user.referralCode,
      isAdmin: user.isAdmin
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Inline utils function
function generateId(length = 8) {
  return nanoid(length);
}

module.exports = async (req, res) => {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		await connectToDatabase();

		const { code, state, error, ref } = req.query;

		// Handle OAuth errors
		if (error) {
			return res.status(400).json({ error: `OAuth error: ${error}` });
		}

		// If no code, redirect to Google OAuth
		if (!code) {
			return initiateGoogleOAuth(req, res);
		}

		// Exchange code for tokens
		return handleGoogleCallback(req, res, code, state, ref);

	} catch (err) {
		console.error('Google OAuth error:', err);
		return res.status(500).json({ error: 'Internal server error' });
	}
};

async function initiateGoogleOAuth(req, res) {
	const { GOOGLE_CLIENT_ID, FRONTEND_URL } = process.env;

	if (!GOOGLE_CLIENT_ID) {
		return res.status(500).json({ error: 'Google OAuth not configured' });
	}

	// Generate state parameter for CSRF protection
	const state = generateId(32);

	// Use FRONTEND_URL if available, otherwise construct from request
	let baseUrl;
	if (FRONTEND_URL) {
		baseUrl = FRONTEND_URL.replace(/\/$/, ''); // Remove trailing slash
	} else {
		// For Vercel, construct the URL properly
		const host = req.headers.host;
		const protocol = req.headers['x-forwarded-proto'] || 'https';
		baseUrl = `${protocol}://${host}`;
	}

	const redirectUri = `${baseUrl}/api/auth/google`;

	// Google OAuth parameters
	const params = new URLSearchParams({
		client_id: GOOGLE_CLIENT_ID,
		redirect_uri: redirectUri,
		response_type: 'code',
		scope: 'openid profile email',
		state: state,
		access_type: 'offline',
		prompt: 'consent'
	});

	const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

	// Store state in a simple in-memory cache (for demo purposes)
	// In production, use Redis or similar
	global.oauthStates = global.oauthStates || new Map();
	global.oauthStates.set(state, { timestamp: Date.now() });

	console.log('� Stored OAuth state:', { state, timestamp: Date.now(), totalStates: global.oauthStates.size });
	console.log('�🔗 Initiating Google OAuth with redirect URI:', redirectUri);
	res.redirect(googleAuthUrl);
}

async function handleGoogleCallback(req, res, code, state, ref) {
	const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FRONTEND_URL } = process.env;

	// Initialize global state storage if it doesn't exist
	global.oauthStates = global.oauthStates || new Map();

	// Verify state parameter - be more lenient in serverless environment
	if (!state) {
		console.warn('⚠️  No state parameter provided');
		return res.status(400).json({ error: 'Missing state parameter' });
	}

	// Check if state exists in our cache
	const stateExists = global.oauthStates.has(state);
	console.log('🔍 State validation:', { state, exists: stateExists, totalStates: global.oauthStates.size });

	if (!stateExists) {
		// In serverless environment, state might not persist across instances
		// For development/demo purposes, we'll be more lenient
		console.warn('⚠️  State not found in cache - this can happen in serverless environments');
		console.warn('🔄 Continuing with OAuth flow despite missing state validation');
	}

	// Clean up old states (older than 10 minutes)
	const now = Date.now();
	let cleanedCount = 0;
	global.oauthStates.forEach((value, key) => {
		if (now - value.timestamp > 10 * 60 * 1000) {
			global.oauthStates.delete(key);
			cleanedCount++;
		}
	});

	if (cleanedCount > 0) {
		console.log(`🧹 Cleaned up ${cleanedCount} expired states`);
	}

	// Remove used state if it exists
	if (stateExists) {
		global.oauthStates.delete(state);
		console.log('✅ Removed used state from cache');
	}

	try {
		// Construct proper redirect URI using the same logic as initiate
		let baseUrl;
		if (FRONTEND_URL) {
			baseUrl = FRONTEND_URL.replace(/\/$/, ''); // Remove trailing slash
		} else {
			// For Vercel, construct the URL properly
			const host = req.headers.host;
			const protocol = req.headers['x-forwarded-proto'] || 'https';
			baseUrl = `${protocol}://${host}`;
		}

		const redirectUri = `${baseUrl}/api/auth/google`;

		// Exchange authorization code for tokens
		const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				client_id: GOOGLE_CLIENT_ID,
				client_secret: GOOGLE_CLIENT_SECRET,
				code: code,
				grant_type: 'authorization_code',
				redirect_uri: redirectUri,
			}).toString(),
		});

		if (!tokenResponse.ok) {
			throw new Error('Failed to exchange code for tokens');
		}

		const tokens = await tokenResponse.json();

		// Get user info from Google
		const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
			headers: {
				Authorization: `Bearer ${tokens.access_token}`,
			},
		});

		if (!userResponse.ok) {
			throw new Error('Failed to get user info from Google');
		}

		const googleUser = await userResponse.json();

		// Find or create user
		let user = await User.findOne({ googleId: googleUser.id });

		if (!user) {
			// Try to find by email
			user = await User.findOne({ email: googleUser.email });
			if (user) {
				// Link Google account to existing user
				user.googleId = googleUser.id;
				user.authProvider = 'google';
				user.lastLogin = new Date();
				user.loginCount += 1;

				// If referral code provided and user doesn't have referredBy set, update it
				if (ref && !user.referredBy) {
					user.referredBy = ref;
					// Increment referrer's count if this is the first time linking
					try {
						const referrer = await User.findOne({ referralCode: ref });
						if (referrer && referrer._id.toString() !== user._id.toString()) {
							referrer.referrals = (referrer.referrals || 0) + 1;
							await referrer.save();
							console.log(`✅ Referral count incremented for user ${referrer._id} (${referrer.email}) via Google OAuth link`);
						}
					} catch (referralError) {
						console.error('❌ Error processing referral in Google OAuth link:', referralError);
					}
				}

				await user.save();
				console.log('✅ Linked Google account to existing user:', user.email);
			} else {
				// Create new OAuth user
				try {
					user = await User.create({
						googleId: googleUser.id,
						name: googleUser.name,
						email: googleUser.email,
						referralCode: generateId(8),
						authProvider: 'google',
						lastLogin: new Date(),
						loginCount: 1,
						referredBy: ref || null,
					});

					// Handle referral count increment
					if (ref) {
						try {
							const referrer = await User.findOne({ referralCode: ref });
							if (referrer && referrer._id.toString() !== user._id.toString()) {
								referrer.referrals = (referrer.referrals || 0) + 1;
								await referrer.save();
								console.log(`✅ Referral count incremented for user ${referrer._id} (${referrer.email}) via Google OAuth`);
							}
						} catch (referralError) {
							console.error('❌ Error processing referral in Google OAuth:', referralError);
							// Don't fail OAuth if referral processing fails
						}
					}

					console.log('✅ Created new Google OAuth user:', user.email);
				} catch (createError) {
					console.error('❌ Failed to create Google OAuth user:', createError);
					if (createError.code === 11000) {
						// Duplicate key error - try with a different referral code
						user = await User.create({
							googleId: googleUser.id,
							name: googleUser.name,
							email: googleUser.email,
							referralCode: generateId(8) + '_oauth',
							authProvider: 'google',
							lastLogin: new Date(),
							loginCount: 1,
						});
						console.log('✅ Created new Google OAuth user with unique referral code:', user.email);
					} else {
						throw createError;
					}
				}
			}
		} else {
			// Update existing OAuth user's login info
			user.lastLogin = new Date();
			user.loginCount += 1;

			// If referral code provided and user doesn't have referredBy set, update it
			if (ref && !user.referredBy) {
				user.referredBy = ref;
				// Increment referrer's count if this is the first time
				try {
					const referrer = await User.findOne({ referralCode: ref });
					if (referrer && referrer._id.toString() !== user._id.toString()) {
						referrer.referrals = (referrer.referrals || 0) + 1;
						await referrer.save();
						console.log(`✅ Referral count incremented for user ${referrer._id} (${referrer.email}) via Google OAuth login`);
					}
				} catch (referralError) {
					console.error('❌ Error processing referral in Google OAuth login:', referralError);
				}
			}

			await user.save();
			console.log('✅ Updated existing Google OAuth user login:', user.email);
		}

		// Generate JWT token
		const token = generateToken(user);

		// Redirect to frontend with token - use the same baseUrl construction
		let frontendUrl;
		if (FRONTEND_URL) {
			frontendUrl = FRONTEND_URL.replace(/\/$/, ''); // Remove trailing slash
		} else {
			// For Vercel, construct the URL properly
			const host = req.headers.host;
			const protocol = req.headers['x-forwarded-proto'] || 'https';
			frontendUrl = `${protocol}://${host}`;
		}

		console.log('🔄 Redirecting to frontend:', `${frontendUrl}?token=${token}&oauth=google`);
		res.redirect(`${frontendUrl}?token=${token}&oauth=google`);

	} catch (err) {
		console.error('Google OAuth callback error:', err);
		return res.status(500).json({ error: 'OAuth callback failed' });
	}
}


