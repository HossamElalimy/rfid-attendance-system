const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  studentId: { type: String, required: true },
  status: { type: String, enum: ["present", "late", "absent"], required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
