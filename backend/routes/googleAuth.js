const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const User = require('../models/User');
const { nanoid } = require('nanoid');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const router = express.Router();

// Passport session setup
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/api/auth/google/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (!user) {
        // Try to find by email
        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          // Link Google account to existing user
          user.googleId = profile.id;
          await user.save();
        } else {
          // Create new user
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
            referralCode: nanoid(8),
          });
        }
      }
      return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// Auth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: true }),
  (req, res) => {
    // Issue JWT and redirect to frontend with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000/';
    const user = req.user;
    const token = jwt.sign(
      {
        _id: user._id,
        name: user.name,
        email: user.email,
        referralCode: user.referralCode
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    // Redirect with token as query param
    res.redirect(`${frontendUrl}?token=${token}`);
  }
);

module.exports = router;
