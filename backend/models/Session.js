const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  batch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  batchName: { type: String },
  subjectName: { type: String, required: true },
  teacher_name: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  startTime: { type: String },
  endTime: { type: String },
  qr_code_id: { type: String, unique: true, required: true },
  createdAt: { type: Date, default: Date.now, expires: 86400 } // 24 hours TTL
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
