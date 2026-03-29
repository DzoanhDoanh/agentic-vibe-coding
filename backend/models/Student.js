// backend/models/Student.js
const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  full_name: { type: String, required: true },
  parent_name: { type: String },
  phone: { type: String },
  dob: { type: Date },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  status: { type: String, enum: ['Studying', 'Reserved', 'Dropped'], default: 'Studying' }
}, { timestamps: true });

module.exports = mongoose.model('Student', studentSchema);
