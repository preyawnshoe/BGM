const mongoose = require('mongoose');
require('dotenv').config({ path: __dirname + '/../.env' });

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.once('open', async () => {
  try {
    await db.collection('users').deleteMany({});
    await db.collection('tickets').deleteMany({});
    // Add more collections if needed
    console.log('Database cleared!');
  } catch (err) {
    console.error('Error clearing database:', err);
  } finally {
    process.exit(0);
  }
});
