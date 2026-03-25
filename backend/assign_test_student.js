const mongoose = require('mongoose');
const User = require('./models/User');
const Batch = require('./models/Batch');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pace_db';

mongoose.connect(MONGO_URI)
  .then(async () => {
    const batch = await Batch.findOne();
    if (!batch) {
      console.log('No batch found. Please create one first via UI.');
      process.exit(0);
    }
    const user = await User.findOne({ username: 'user1' });
    if (user) {
      user.batch_id = batch._id;
      await user.save();
      console.log(`Assigned user1 to batch ${batch.name}`);
    } else {
      console.log('User1 not found');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
