const { connectToDatabase } = require('../_lib/db');
const User = require('../../backend/models/User');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

module.exports = async (req, res) => {
	if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
	await connectToDatabase();
	const { code } = req.query || {};
	const owner = await User.findOne({ referralCode: code });
	if (!owner) return res.status(404).send('Invalid referral');
	const signupUrl = `${FRONTEND_URL}/signup?ref=${encodeURIComponent(code)}`;
	res.status(302).setHeader('Location', signupUrl);
	return res.send('');
};


