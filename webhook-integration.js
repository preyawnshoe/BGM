const mongoose = require('mongoose');

// Inline MongoDB URI - Replace with your actual connection string
const MONGO_URI = 'mongodb+srv://bgmcommunications_db_user:BGM%402026@bgm2026.4pu4sjb.mongodb.net/?retryWrites=true&w=majority&appName=bgm2026';

// Database connection with caching
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    const uri = MONGO_URI;
    const masked = uri ? uri.replace(/(\/\/)([^:@]+):([^@]+)@/, '****:****@') : '(undefined)';
    console.log('[DB] Using Mongo URI:', masked);
    if (!uri) throw new Error('Missing MONGO_URI');
    cached.promise = mongoose.connect(uri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    }).then(m => m);
  }
  cached.conn = await cached.promise;
  console.log('[DB] Connected successfully!');
  return cached.conn;
}

// Ticket schema for webhook data
const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true, index: true },
  subject: { type: String, required: true },
  description: { type: String },
  status: { type: String, required: true },
  priority: { type: String },
  type: { type: String },
  tags: [{ type: String }],
  requester: {
    id: String,
    name: String,
    email: String,
  },
  assignee: {
    id: String,
    name: String,
    email: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  source: { type: String, default: 'webhook' },
  rawData: { type: mongoose.Schema.Types.Mixed } // Store complete webhook response
}, { timestamps: true });

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

// Main webhook processing function
async function processWebhook(webhookData) {
  try {
    console.log(' Processing Tikkl webhook...');
    await connectToDatabase();

    // Log incoming data
    console.log('Raw Tikkl webhook data:', JSON.stringify(webhookData, null, 2));

    // Map Tikkl webhook data to ticket fields
    const ticketData = {
      ticketId: webhookData.ticketId?.toString(),
      subject: `${webhookData.campaignName || 'Event Registration'} - ${webhookData.registrantName || 'Unknown'}`,
      description: `Event: ${webhookData.eventName || webhookData.campaignName}\nOrder ID: ${webhookData.orderId}\nOrganization: ${webhookData.orgName}\nCampaign URL: ${webhookData.campaignUrl}`,
      status: 'confirmed', // Tikkl tickets are typically confirmed upon creation
      priority: 'normal',
      type: 'event_registration',
      tags: ['tikkl', 'event', 'registration'],
      requester: {
        id: webhookData.orderId, // Use orderId as requester ID
        name: webhookData.registrantName,
        email: webhookData.registrantEmail,
      },
      assignee: null, // No assignee for automated ticket creation
      createdAt: webhookData.orderTimeUtc ? new Date(webhookData.orderTimeUtc) : new Date(),
      updatedAt: webhookData.orderTimeUtc ? new Date(webhookData.orderTimeUtc) : new Date(),
      source: 'tikkl',
      rawData: webhookData // Store complete Tikkl response
    };

    // Validate required fields
    if (!ticketData.ticketId) {
      throw new Error('Missing ticketId in Tikkl webhook response');
    }
    if (!ticketData.requester.email) {
      throw new Error('Missing registrantEmail in Tikkl webhook response');
    }

    // Create or update ticket
    const ticket = await Ticket.findOneAndUpdate(
      { ticketId: ticketData.ticketId },
      ticketData,
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    console.log(`✅ Tikkl ticket ${ticket.ticketId} saved successfully`);
    console.log(`   Registrant: ${ticket.requester.name} (${ticket.requester.email})`);
    console.log(`   Event: ${webhookData.eventName || webhookData.campaignName}`);
    console.log(`   Order ID: ${webhookData.orderId}`);
    console.log(`   Created: ${ticket.createdAt}`);

    return {
      success: true,
      ticketId: ticket.ticketId,
      action: ticket.isNew ? 'created' : 'updated',
      registrant: {
        name: ticket.requester.name,
        email: ticket.requester.email
      },
      event: webhookData.eventName || webhookData.campaignName,
      orderId: webhookData.orderId,
      ticket: ticket
    };

  } catch (error) {
    console.error('❌ Error processing Tikkl webhook:', error);
    throw error;
  }
}

// Sample webhook data for testing (Tikkl format)
const sampleWebhookData = {
  "objectType": "ticket",
  "ticketId": "123-45678901-2345678-001",
  "orderId": "123-45678901-2345678",
  "orgName": "Awesome Org",
  "orgSubdomain": "awesomeorg",
  "campaignName": "My Tech Conference",
  "campaignUrl": "https://tikkl.com/awesomeorg/c/tech-conf",
  "orderUrl": "https://tikkl.com/awesomeorg/admin/c/tech-conf/participation/123-45678901-2345678",
  "eventName": "My Tech Conference",
  "orderTimeUtc": "2025-06-22T14:45:30Z",
  "registrantName": "John Smith",
  "registrantEmail": "john@example.com"
};

// Vercel serverless function export
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const result = await processWebhook(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error('Webhook processing failed:', error);
    res.status(500).json({
      error: 'Failed to process webhook',
      details: error.message
    });
  }
};

// Export functions for use in other files
module.exports.processWebhook = processWebhook;

// Test function - run this to test with sample data
async function testWithSampleData() {
  try {
    console.log('🧪 Testing webhook integration...');
    const result = await processWebhook(sampleWebhookData);
    console.log('✅ Test result:', result);
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testWithSampleData();
}
