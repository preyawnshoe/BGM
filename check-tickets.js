const mongoose = require('mongoose');

// Use the same MongoDB URI as your webhook script
const MONGO_URI = 'mongodb+srv://bgmcommunications_db_user:BGM%402026@bgm2026.4pu4sjb.mongodb.net/bgm_referral?retryWrites=true&w=majority&appName=bgm2026';

// Database connection
async function connectToDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

// Ticket schema (same as webhook script)
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
  rawData: { type: mongoose.Schema.Types.Mixed }
}, { timestamps: true });

const Ticket = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);

// Check tickets in database
async function checkTickets() {
  try {
    await connectToDatabase();

    // Count total tickets
    const totalTickets = await Ticket.countDocuments();
    console.log(`📊 Total tickets in database: ${totalTickets}`);

    // Get all tickets
    const tickets = await Ticket.find({}).sort({ createdAt: -1 }).limit(10);
    console.log('\n🎫 Recent tickets:');

    tickets.forEach((ticket, index) => {
      console.log(`${index + 1}. Ticket ID: ${ticket.ticketId}`);
      console.log(`   Subject: ${ticket.subject}`);
      console.log(`   Status: ${ticket.status}`);
      console.log(`   Registrant: ${ticket.requester.name} (${ticket.requester.email})`);
      console.log(`   Created: ${ticket.createdAt}`);
      console.log(`   Source: ${ticket.source}`);
      console.log('   ---');
    });

    // Specifically check for the sample ticket
    const sampleTicket = await Ticket.findOne({ ticketId: '123-45678901-2345678-001' });
    if (sampleTicket) {
      console.log('\n✅ Sample ticket found!');
      console.log('Ticket details:', JSON.stringify(sampleTicket, null, 2));
    } else {
      console.log('\n❌ Sample ticket not found');
    }

  } catch (error) {
    console.error('❌ Error checking tickets:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the check
checkTickets();