const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
  class_id: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  amount: { type: Number, required: true },
  paid_amount: { type: Number, default: 0 },
  status: { type: String, enum: ["Unpaid", "Partial", "Paid"], default: "Unpaid" },
  payment_date: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model("Invoice", invoiceSchema);
