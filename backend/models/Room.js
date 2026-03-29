// backend/models/Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  capacity: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Room', roomSchema);
