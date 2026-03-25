const mongoose = require('mongoose');
const User = require('./models/User');
const Batch = require('./models/Batch');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pace_db';

mongoose.connect(MONGO_URI)
  .then(async () => {
    const batches = await Batch.find();
    console.log('Batches found:', JSON.stringify(batches.map(b => ({ id: b._id, name: b.name })), null, 2));
    
    const users = await User.find({ role: 'student' }).populate('batch_id');
    console.log('Students and their batches:', JSON.stringify(users.map(u => ({ 
      username: u.username, 
      batch: u.batch_id ? u.batch_id.name : 'None',
      batch_id: u.batch_id ? u.batch_id._id : 'None'
    })), null, 2));
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
