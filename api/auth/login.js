const { connectToDatabase } = require('../../_lib/db');
const User = require('../../../backend/models/User');

module.exports = async (req, res) => {
	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}
	await connectToDatabase();
	const { email } = req.body || {};
	if (!email) return res.status(400).json({ error: 'email is required' });
	const user = await User.findOne({ email: String(email).toLowerCase() }).lean();
	if (!user) return res.status(404).json({ error: 'User not found' });
	return res.status(200).json({ user });
};


