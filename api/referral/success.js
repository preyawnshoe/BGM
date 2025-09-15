const { connectToDatabase } = require('../_lib/db');
const User = require('../../backend/models/User');

module.exports = async (req, res) => {
	if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
	await connectToDatabase();
	const { token } = req.body || {};
	if (!token) return res.status(400).json({ error: 'token required' });
	const owner = await User.findOne({ pendingTokens: token });
	if (!owner) return res.status(404).json({ error: 'Invalid token' });
	owner.pendingTokens = owner.pendingTokens.filter(t => t !== token);
	await owner.save();
	return res.status(200).json({ ok: true });
};


