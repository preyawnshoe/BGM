const { connectToDatabase } = require('../_lib/db');
const User = require('../../backend/models/User');

module.exports = async (_req, res) => {
	await connectToDatabase();
	const users = await User.find({}).sort({ referrals: -1 }).limit(100).lean();
	const top = users.map(u => ({ name: u.name, email: u.email, referrals: u.referrals || 0, referralCode: u.referralCode }));
	return res.status(200).json({ leaderboard: top });
};


