require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function createAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Check if admin user already exists
    const existingAdmin = await Admin.findOne({ email: 'admin@bgm.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const adminUser = new Admin({
      username: 'admin',
      email: 'admin@bgm.com',
      password: 'admin123', // This will be hashed automatically
      role: 'super_admin',
      permissions: ['users', 'referrals', 'analytics', 'settings', 'logs'],
      isActive: true
    });

    await adminUser.save();
    console.log('Admin user created successfully:', {
      username: adminUser.username,
      email: adminUser.email,
      role: adminUser.role,
      permissions: adminUser.permissions
    });

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('MongoDB disconnected');

  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
}

createAdminUser();


