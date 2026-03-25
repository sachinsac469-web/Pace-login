const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  exam_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, required: true },
  feedback: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Result', resultSchema);
