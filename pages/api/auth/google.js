module.exports = async (_req, res) => {
	return res.status(501).json({ error: 'Google OAuth serverless flow not yet implemented. Consider using an auth provider or a PKCE-based callback that issues a JWT.' });
};


