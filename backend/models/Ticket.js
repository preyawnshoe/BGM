const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true, index: true },
  used: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // Additional fields for Tikkl integration
  subject: { type: String },
  description: { type: String },
  status: { type: String },
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
  source: { type: String, default: 'manual' }, // 'manual' or 'tikkl'
  rawData: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema); 
