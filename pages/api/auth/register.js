const { connectToDatabase } = require('../_lib/db');
const User = require('../_lib/User');
const { generateId } = require('../_lib/utils');
const { hashPassword, generateToken } = require('../_lib/auth');

module.exports = async (req, res) => {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}
	await connectToDatabase();
	try {
		const { name, email, password, referralCode } = req.body || {};
		if (!name || !email || !password) return res.status(400).json({ error: 'name, email, and password are required' });

		const exists = await User.findOne({ email: String(email).toLowerCase() }).lean();
		if (exists) return res.status(409).json({ error: 'Email already registered' });

		const hashedPassword = await hashPassword(password);
		const newReferralCode = generateId(8);

		const user = await User.create({
			name,
			email: String(email).toLowerCase(),
			password: hashedPassword,
			referralCode: newReferralCode,
			referredBy: referralCode || null,
		});

		const token = generateToken(user);

		// Return user without password
		const userResponse = {
			_id: user._id,
			name: user.name,
			email: user.email,
			referralCode: user.referralCode,
			referrals: user.referrals,
			referredBy: user.referredBy,
			isAdmin: user.isAdmin
		};

		return res.status(200).json({ user: userResponse, token });
	} catch (e) {
		console.error('Registration error:', e);
		if (e && e.code === 11000) return res.status(409).json({ error: 'Duplicate key' });
		return res.status(500).json({ error: 'Server error' });
	}
};


