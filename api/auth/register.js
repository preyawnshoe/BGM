const { connectToDatabase } = require('../../_lib/db');
const User = require('../../../backend/models/User');
const { generateId } = require('../../../backend/utils/id');

module.exports = async (req, res) => {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}
	await connectToDatabase();
	try {
		const { name, email, referralCode } = req.body || {};
		if (!name || !email) return res.status(400).json({ error: 'name and email are required' });
		const exists = await User.findOne({ email: String(email).toLowerCase() }).lean();
		if (exists) return res.status(409).json({ error: 'Email already registered' });
		const newReferralCode = generateId(8);
		const user = await User.create({
			name,
			email: String(email).toLowerCase(),
			referralCode: newReferralCode,
			referredBy: referralCode || null,
		});
		return res.status(200).json({ user });
	} catch (e) {
		if (e && e.code === 11000) return res.status(409).json({ error: 'Duplicate key' });
		return res.status(500).json({ error: 'Server error' });
	}
};


