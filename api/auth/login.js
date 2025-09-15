const { connectToDatabase } = require('../_lib/db');
const User = require('../_lib/User');
const { verifyPassword, generateToken } = require('../_lib/auth');

module.exports = async (req, res) => {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}
	await connectToDatabase();
	try {
		const { email, password } = req.body || {};
		if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

		const user = await User.findOne({ email: String(email).toLowerCase() });
		if (!user) return res.status(404).json({ error: 'User not found' });

		const isValidPassword = await verifyPassword(password, user.password);
		if (!isValidPassword) return res.status(401).json({ error: 'Invalid password' });

		// Update login stats
		user.lastLogin = new Date();
		user.loginCount = (user.loginCount || 0) + 1;
		await user.save();

		const token = generateToken(user);

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
			loginCount: user.loginCount
		};

		return res.status(200).json({ user: userResponse, token });
	} catch (e) {
		console.error('Login error:', e);
		return res.status(500).json({ error: 'Server error' });
	}
};


