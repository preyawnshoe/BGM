module.exports = async (req, res) => {
  res.status(200).json({ 
    message: 'API is working!', 
    method: req.method,
    timestamp: new Date().toISOString(),
    environment: {
      hasMongoUri: !!process.env.MONGO_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
      frontendUrl: process.env.FRONTEND_URL
    }
  });
};