const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Load environment variables
require('dotenv').config();

// Helper function to load API route handlers
function loadApiRoute(routePath) {
  const fullPath = path.join(__dirname, 'pages', routePath);
  if (fs.existsSync(fullPath)) {
    delete require.cache[require.resolve(fullPath)];
    return require(fullPath);
  }
  return null;
}

// Helper to create route handlers
function createRouteHandler(handlerPath) {
  return async (req, res) => {
    try {
      const handler = loadApiRoute(handlerPath);
      if (!handler) {
        return res.status(404).json({ error: 'API route not found' });
      }
      
      // Create mock Vercel-like request/response objects
      const mockReq = { ...req, query: { ...req.query, ...req.params } };
      const mockRes = {
        ...res,
        status: (code) => {
          res.status(code);
          return mockRes;
        },
        json: (data) => {
          res.json(data);
          return mockRes;
        }
      };
      
      await handler(mockReq, mockRes);
    } catch (error) {
      console.error('API Route Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
}

// Register API routes
app.use('/api/test', createRouteHandler('api/test.js'));
app.use('/api/auth/register', createRouteHandler('api/auth/register.js'));
app.use('/api/auth/login', createRouteHandler('api/auth/login.js'));
app.use('/api/auth/google', createRouteHandler('api/auth/google.js'));
app.use('/api/auth/me', createRouteHandler('api/auth/me.js'));
app.use('/api/auth/user/:referralCode', createRouteHandler('api/auth/user/[referralCode].js'));
app.use('/api/leaderboard', createRouteHandler('api/leaderboard/index.js'));
app.use('/api/referral/success', createRouteHandler('api/referral/success.js'));
app.use('/api/referral/:code', createRouteHandler('api/referral/[code].js'));
app.use('/api/ticket/verify', createRouteHandler('api/ticket/verify.js'));
app.use('/api/ticket/user/:userId', createRouteHandler('api/ticket/user/[userId].js'));
app.use('/api/webhooks/tikkl', createRouteHandler('api/webhooks/tikkl.js'));

app.listen(PORT, () => {
  console.log(`🚀 Development API server running on http://localhost:${PORT}`);
  console.log(`📚 Available routes:`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/auth/google`);
  console.log(`   GET  /api/auth/me`);
  console.log(`   GET  /api/leaderboard`);
  console.log(`   ...and more`);
});