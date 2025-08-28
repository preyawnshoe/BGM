const express = require('express');
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const authRoutes = require('./routes/auth');
const referralRoutes = require('./routes/referral');
const leaderboardRoutes = require('./routes/leaderboard');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// MongoDB
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bgm_referrals';
mongoose.connect(mongoUri, { autoIndex: true }).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error('MongoDB connection error', err);
  process.exit(1);
});

// Helpers
function generateId(length = 10) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < length; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

const TIKKL_EVENT_URL = 'https://tikkl.com/bgm/c/bgm26-hyd';

// Routes
app.use('/api', authRoutes);
app.use('/api/ref', referralRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});