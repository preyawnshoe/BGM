require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');

const app = express();
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);

// Middleware setup
app.use(cors({ origin: true, credentials: true }));
app.use(express.json()); // Use express.json() instead of bodyParser
app.use(express.urlencoded({ extended: true }));

// Session and passport setup (required for Google OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // set to true if using https
}));
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// API routes - properly organized to avoid conflicts
app.use('/api/auth', require('./routes/auth')); // Regular auth routes
app.use('/api/auth', require('./routes/googleAuth')); // Google auth routes (will be merged)
app.use('/api/ticket', require('./routes/ticket'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/user', require('./routes/user'));
app.use('/api/referral', require('./routes/referral'));
app.use('/api/volunteer', require('./routes/volunteer'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/admin-auth', require('./routes/adminAuth'));

// Serve static files from React app
app.use(express.static(path.join(__dirname, '../public')));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
