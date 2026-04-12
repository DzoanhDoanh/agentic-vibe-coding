const mongoose = require("mongoose");

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  capacity: { type: Number, default: 20 },
  branch_id: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true },
  status: { type: String, enum: ["Available", "Maintenance"], default: "Available" }
}, { timestamps: true });

module.exports = mongoose.model("Room", roomSchema);
