const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
require('dotenv').config();

const router = express.Router();

// Admin middleware - checks if user is admin using separate admin system
async function adminMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided.' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if this is an admin token (not a regular user token)
    if (!decoded.adminId) {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    
    // Verify admin still exists and is active
    const admin = await Admin.findById(decoded.adminId);
    if (!admin || !admin.isActive) {
      return res.status(403).json({ message: 'Admin account not found or inactive.' });
    }
    
    req.admin = admin;
    next();
    
  } catch (err) {
    console.error('Admin middleware error:', err);
    return res.status(401).json({ message: 'Invalid token.' });
  }
}

// Get all users (admin only)
router.get('/users', adminMiddleware, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error while fetching users.' });
  }
});

// Get system statistics (admin only)
router.get('/stats', adminMiddleware, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalReferrals = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$referrals' } } }
    ]);
    
    const activeUsers = await User.countDocuments({ 
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } 
    });
    
    const pendingReferrals = await User.countDocuments({ 
      'pendingTokens.0': { $exists: true } 
    });

    res.json({
      totalUsers,
      totalReferrals: totalReferrals[0]?.total || 0,
      activeUsers,
      pendingReferrals
    });
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ message: 'Server error while fetching statistics.' });
  }
});

// Edit user (admin only)
router.put('/users/:userId/edit', adminMiddleware, async (req, res) => {
  try {
    console.log('Edit user request body:', req.body); // Debug log
    
    // Safely extract body data with defaults
    const { name, email, referrals } = req.body || {};
    const updateData = {};
    
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (referrals !== undefined) updateData.referrals = referrals;
    
    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update.' });
    }
    
    console.log('Update data:', updateData); // Debug log
    
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Error editing user:', err);
    res.status(500).json({ message: 'Server error while editing user.' });
  }
});

// Ban user (admin only)
router.put('/users/:userId/ban', adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBanned: true, bannedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.json({ message: 'User banned successfully', user });
  } catch (err) {
    console.error('Error banning user:', err);
    res.status(500).json({ message: 'Server error while banning user.' });
  }
});

// Unban user (admin only)
router.put('/users/:userId/unban', adminMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { isBanned: false, $unset: { bannedAt: 1 } },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    res.json({ message: 'User unbanned successfully', user });
  } catch (err) {
    console.error('Error unbanning user:', err);
    res.status(500).json({ message: 'Server error while unbanned user.' });
  }
});

// Delete user (admin only)
router.delete('/users/:userId', adminMiddleware, async (req, res) => {
  try {
    console.log('Delete user request for ID:', req.params.userId); // Debug log
    
    const user = await User.findByIdAndDelete(req.params.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    console.log('User deleted successfully:', user._id); // Debug log
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error while deleting user.' });
  }
});

// Get referral analytics (admin only)
router.get('/referrals/analytics', adminMiddleware, async (req, res) => {
  try {
    const referralStats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalReferrals: { $sum: '$referrals' },
          avgReferrals: { $avg: '$referrals' },
          maxReferrals: { $max: '$referrals' },
          usersWithReferrals: {
            $sum: { $cond: [{ $gt: ['$referrals', 0] }, 1, 0] }
          }
        }
      }
    ]);
    
    const topReferrers = await User.find({ referrals: { $gt: 0 } })
      .select('name email referrals referralCode')
      .sort({ referrals: -1 })
      .limit(10);
    
    const recentReferrals = await User.find({ referrals: { $gt: 0 } })
      .select('name email referrals createdAt')
      .sort({ createdAt: -1 })
      .limit(20);
    
    res.json({
      stats: referralStats[0] || {},
      topReferrers,
      recentReferrals
    });
  } catch (err) {
    console.error('Error fetching referral analytics:', err);
    res.status(500).json({ message: 'Server error while fetching referral analytics.' });
  }
});

// Get system logs (admin only)
router.get('/logs', adminMiddleware, async (req, res) => {
  try {
    // This would typically connect to a logging service
    // For now, we'll return basic system info
    const systemInfo = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: new Date()
    };
    
    res.json(systemInfo);
  } catch (err) {
    console.error('Error fetching system logs:', err);
    res.status(500).json({ message: 'Server error while fetching system logs.' });
  }
});

module.exports = router;
