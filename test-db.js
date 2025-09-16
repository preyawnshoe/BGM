const { connectToDatabase } = require('./pages/api/_lib/db');

// Test database connection
async function testDatabaseConnection() {
  try {
    console.log('🔄 Testing database connection...');
    await connectToDatabase();
    console.log('✅ Database connection successful!');
    return true;
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('💡 Please update MONGO_URI in .env with your MongoDB Atlas connection string');
    console.log('   Format: mongodb+srv://username:password@cluster.mongodb.net/database');
    return false;
  }
}

if (require.main === module) {
  testDatabaseConnection();
}

module.exports = { testDatabaseConnection };