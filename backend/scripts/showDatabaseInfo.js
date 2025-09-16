require('dotenv').config({ path: __dirname + '/../.env' });
const mongoose = require('mongoose');

// Import models to ensure they're registered
const User = require('../models/User');
const Admin = require('../models/Admin');
const Ticket = require('../models/Ticket');

async function showDatabaseInfo() {
  try {
    console.log('🔌 Connecting to MongoDB...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB successfully!\n');

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    console.log('📊 DATABASE OVERVIEW');
    console.log('==================\n');

    // Show all collections and their document counts
    console.log('📋 COLLECTIONS & DOCUMENT COUNTS:');
    console.log('----------------------------------');

    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`📁 ${collection.name}: ${count} documents`);
    }

    console.log('\n');

    // Show detailed data for each collection
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`🔍 ${collectionName.toUpperCase()} COLLECTION DETAILS`);
      console.log('='.repeat(50));

      const Model = getModelByCollectionName(collectionName);
      if (Model) {
        // Get sample documents
        const sampleDocs = await Model.find().limit(5).lean();

        if (sampleDocs.length > 0) {
          console.log(`📄 Sample ${collectionName} documents:`);
          sampleDocs.forEach((doc, index) => {
            console.log(`\n  Document ${index + 1}:`);
            console.log(`  ${JSON.stringify(doc, null, 2)}`);
          });
        } else {
          console.log(`📭 No documents found in ${collectionName}`);
        }

        // Show collection statistics
        const totalCount = await Model.countDocuments();
        console.log(`\n📊 Statistics for ${collectionName}:`);
        console.log(`  Total documents: ${totalCount}`);

        // Additional statistics based on collection type
        if (collectionName === 'users') {
          const adminCount = await Model.countDocuments({ isAdmin: true });
          const bannedCount = await Model.countDocuments({ isBanned: true });
          const googleUsers = await Model.countDocuments({ authProvider: 'google' });
          console.log(`  Admin users: ${adminCount}`);
          console.log(`  Banned users: ${bannedCount}`);
          console.log(`  Google OAuth users: ${googleUsers}`);
        } else if (collectionName === 'tickets') {
          const usedTickets = await Model.countDocuments({ used: true });
          const unusedTickets = await Model.countDocuments({ used: false });
          console.log(`  Used tickets: ${usedTickets}`);
          console.log(`  Unused tickets: ${unusedTickets}`);
        } else if (collectionName === 'admins') {
          const activeAdmins = await Model.countDocuments({ isActive: true });
          const superAdmins = await Model.countDocuments({ role: 'super_admin' });
          console.log(`  Active admins: ${activeAdmins}`);
          console.log(`  Super admins: ${superAdmins}`);
        }

      } else {
        // Fallback for collections without models
        const docs = await db.collection(collectionName).find().limit(3).toArray();
        if (docs.length > 0) {
          console.log(`📄 Raw documents from ${collectionName}:`);
          docs.forEach((doc, index) => {
            console.log(`\n  Document ${index + 1}:`);
            console.log(`  ${JSON.stringify(doc, null, 2)}`);
          });
        }
      }

      console.log('\n' + '='.repeat(50) + '\n');
    }

    // Show database statistics
    console.log('📈 DATABASE STATISTICS');
    console.log('=====================');

    const stats = await db.stats();
    console.log(`Database name: ${stats.db}`);
    console.log(`Total collections: ${collections.length}`);
    console.log(`Data size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Storage size: ${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Index size: ${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`);

  } catch (error) {
    console.error('❌ Error connecting to database:', error.message);
    if (error.message.includes('authentication failed')) {
      console.log('\n💡 Tip: Check your MONGO_URI in the .env file');
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
  }
}

function getModelByCollectionName(collectionName) {
  const modelMap = {
    'users': User,
    'admins': Admin,
    'tickets': Ticket
  };

  return modelMap[collectionName];
}

// Run the script
if (require.main === module) {
  showDatabaseInfo();
}

module.exports = { showDatabaseInfo };