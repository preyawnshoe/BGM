const { connectToDatabase } = require('../../_lib/db');
const User = require('../../_lib/User');

module.exports = async (req, res) => {
	if (req.method !== 'GET') {
		return res.status(405).json({ error: 'Method not allowed' });
	}
	await connectToDatabase();
	try {
		const { referralCode } = req.query || {};
		const user = await User.findOne({ referralCode }).select('name email').lean();
		if (!user) return res.status(404).json({ error: 'Referral code not found' });
		return res.status(200).json({ user });
	} catch (e) {
		console.error('User referral code error:', e);
		return res.status(500).json({ error: 'Server error' });
	}
};


