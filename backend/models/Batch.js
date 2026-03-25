const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  subjects: [{
    name: { type: String, required: true },
    classesHeld: { type: Number, default: 0 }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);