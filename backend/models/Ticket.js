const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  ticketId: { type: String, required: true, unique: true, index: true },
  used: { type: Boolean, default: false },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Ticket', ticketSchema); 
