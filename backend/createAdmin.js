require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const User = require('./models/User');
const { generateId } = require('./utils/id');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@bgm.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@bgm.com',
      referralCode: generateId(8), // Generate 8-character referral code
      isAdmin: true,
      referrals: 0
    });

    await adminUser.save();
    console.log('Admin user created successfully:', adminUser);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');

  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();
