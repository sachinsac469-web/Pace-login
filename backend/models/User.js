const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  passwordEncrypted: { type: String, required: true },
  role: { type: String, enum: ['admin', 'student'], required: true },
  status: { type: String, enum: ['pending', 'active'], default: 'pending' },
  name: { type: String, required: true },
  currentSessionId: { type: String },
  batchName: { type: String },
  batch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
