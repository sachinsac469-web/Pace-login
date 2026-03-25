const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pace_db';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const User = require('./models/User');
const CryptoJS = require('crypto-js');
const bcrypt = require('bcryptjs');

const Batch = require('./models/Batch');

const SECRET_KEY = 'PACE_SECRET_2026';

const seedUsers = async () => {
  try {
    // Seed default batch
    const defaultBatch = await Batch.findOneAndUpdate(
      { name: 'Fullstack-2024' },
      {
        description: 'MERN Stack Development Batch',
        subjects: [
          { name: 'Node.js', classesHeld: 0 },
          { name: 'React', classesHeld: 0 },
          { name: 'MongoDB', classesHeld: 0 },
          { name: 'Express', classesHeld: 0 }
        ]
      },
      { upsert: true, returnDocument: 'after' }
    );

    const adminPassword = 'admin@123';
    await User.findOneAndUpdate(
      { username: 'admin' },
      {
        email: 'admin@pace.com',
        passwordHash: bcrypt.hashSync(adminPassword, 10),
        passwordEncrypted: CryptoJS.AES.encrypt(adminPassword, SECRET_KEY).toString(),
        role: 'admin',
        status: 'active',
        name: 'Administrator'
      },
      { upsert: true, returnDocument: 'after' }
    );

    const studentPassword = 'user@1';
    await User.findOneAndUpdate(
      { username: 'user1' },
      {
        email: 'user1@pace.com',
        passwordHash: bcrypt.hashSync(studentPassword, 10),
        passwordEncrypted: CryptoJS.AES.encrypt(studentPassword, SECRET_KEY).toString(),
        role: 'student',
        status: 'active', // Mandatory for student testing
        name: 'Test Student',
        batchName: defaultBatch.name,
        batch_id: defaultBatch._id
      },
      { upsert: true, returnDocument: 'after' }
    );
    // Seeded
  } catch (err) {
    console.error('Error seeding data:', err);
  }
};

seedUsers();

module.exports = mongoose;
