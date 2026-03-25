const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  batch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  subject: { type: String, required: true },
  date: { type: String, required: true },
  max_marks: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Exam', examSchema);
