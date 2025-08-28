const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();

// Middleware to verify JWT
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token.' });
  }
}

// Complete volunteer profile
router.post('/complete-profile', authMiddleware, async (req, res) => {
  try {
    console.log('Complete profile request body:', req.body);
    
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.userType !== 'volunteer') {
      return res.status(400).json({ message: 'Only volunteers can complete this profile.' });
    }

    // Update user with detailed volunteer information
    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      emergencyContact,
      emergencyPhone,
      skills,
      interests,
      availability,
      experience,
      motivation,
      preferredActivities,
      timeCommitment
    } = req.body;

    console.log('Extracted data:', {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      emergencyContact,
      emergencyPhone,
      skills,
      interests,
      availability,
      experience,
      motivation,
      preferredActivities,
      timeCommitment
    });

    // Update user fields
    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;
    user.dateOfBirth = dateOfBirth;
    user.address = address;
    user.city = city;
    user.state = state;
    user.emergencyContact = emergencyContact;
    user.emergencyPhone = emergencyPhone;
    user.skills = skills;
    user.interests = interests;
    user.availability = availability;
    user.experience = experience;
    user.motivation = motivation;
    user.preferredActivities = preferredActivities;
    user.timeCommitment = timeCommitment;
    user.profileCompleted = true;

    console.log('Saving user with data:', user);
    await user.save();

    res.json({ message: 'Volunteer profile completed successfully.' });
  } catch (err) {
    console.error('Error completing volunteer profile:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

// Create complete volunteer profile (for users who just completed basic signup)
router.post('/create-complete-profile', async (req, res) => {
  try {
    console.log('Create complete profile request body:', req.body);
    
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      emergencyContact,
      emergencyPhone,
      skills,
      interests,
      availability,
      experience,
      motivation,
      preferredActivities,
      timeCommitment
    } = req.body;

    console.log('Looking for user with email:', email);
    // Find the user by email (they should have been created in basic signup)
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please complete basic signup first.' });
    }

    if (user.userType !== 'volunteer') {
      return res.status(400).json({ message: 'Only volunteers can complete this profile.' });
    }

    console.log('Found user:', user._id);
    // Update user with detailed volunteer information
    user.firstName = firstName;
    user.lastName = lastName;
    user.phone = phone;
    user.dateOfBirth = dateOfBirth;
    user.address = address;
    user.city = city;
    user.state = state;
    user.emergencyContact = emergencyContact;
    user.emergencyPhone = emergencyPhone;
    user.skills = skills;
    user.interests = interests;
    user.availability = availability;
    user.experience = experience;
    user.motivation = motivation;
    user.preferredActivities = preferredActivities;
    user.timeCommitment = timeCommitment;
    user.profileCompleted = true;

    console.log('Saving user with updated data');
    await user.save();

    // Generate JWT token for the user
    const token = jwt.sign(
      { userId: user._id, userType: user.userType, referralCode: user.referralCode },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return token and user data (without password)
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
      referralCode: user.referralCode,
      shareCount: user.shareCount,
      profileCompleted: user.profileCompleted
    };

    console.log('Profile completed successfully for user:', user._id);
    res.json({ 
      message: 'Volunteer profile completed successfully.',
      token,
      user: userResponse
    });
  } catch (err) {
    console.error('Error creating complete volunteer profile:', err);
    res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router; 