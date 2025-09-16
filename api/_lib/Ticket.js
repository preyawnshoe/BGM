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
  tags: [{ type: String }],
  requester: {
    id: Number,
    name: String,
    email: String,
  },
  assignee: {
    id: Number,
    name: String,
    email: String,
  },
  source: { type: String, default: 'manual' }, // 'manual' or 'tikkl'
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.models.Ticket || mongoose.model('Ticket', ticketSchema);