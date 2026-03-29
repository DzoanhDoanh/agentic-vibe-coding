// backend/models/Class.js
const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  name: { type: String, required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  schedule_rule: { type: String }, // e.g., T2-T4-T6, 18:00-19:30
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  enrolled_students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }] 
}, { timestamps: true });

module.exports = mongoose.model('Class', classSchema);
