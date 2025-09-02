// This script creates a sample ticket in the database. Run with: node backend/scripts/createSampleTicket.js
const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bgm_referrals';

async function main() {
  await mongoose.connect(mongoUri);
  const ticketIds = [
    'BGM2026-001',
    'BGM2026-002',
    'BGM2026-003',
    'BGM2026-004',
    'BGM2026-005',
    'BGM2026-006',
    'BGM2026-007',
    'BGM2026-008',
    'BGM2026-009',
    'BGM2026-010',
  ];
  for (const ticketId of ticketIds) {
    const ticket = await Ticket.findOneAndUpdate(
      { ticketId },
      { ticketId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log('Sample ticket created:', ticket.ticketId);
  }
  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
