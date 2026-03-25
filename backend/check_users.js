const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pace_db';

mongoose.connect(MONGO_URI)
  .then(async () => {
    const users = await User.find({}, 'username email role status');
    console.log('Current Users:', JSON.stringify(users, null, 2));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
