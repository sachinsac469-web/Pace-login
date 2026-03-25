const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');
const SECRET_KEY = 'PACE_SECRET_2026';
require('./db'); // Connect to MongoDB

const User = require('./models/User');
const Batch = require('./models/Batch');
const Attendance = require('./models/Attendance');
const Exam = require('./models/Exam');
const Result = require('./models/Result');
const Session = require('./models/Session');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});


// Global store for the current daily QR code
let currentDailyQR = uuidv4();

setInterval(() => {
  currentDailyQR = uuidv4();
}, 24 * 60 * 60 * 1000);

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
}

const reqAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  next();
}

app.get('/api/health', (req, res) => {
  const status = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.json({ database: status });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });

    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account awaiting admin approval.' });
    }

    const session_uuid = uuidv4();
    user.currentSessionId = session_uuid;
    await user.save();

    const token = jwt.sign({
      user_id: user._id.toString(),
      role: user.role,
      name: user.name,
      session_uuid: session_uuid
    }, JWT_SECRET);
    res.json({ token, role: user.role, name: user.name, session_uuid, batchName: user.batchName });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users/forgot-password', async (req, res) => {
  const { username } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: 'Username not found' });

    // Hybrid Security: Decrypt AES to show password
    const bytes = CryptoJS.AES.decrypt(user.passwordEncrypted, SECRET_KEY);
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    res.json({ message: `Your password is: ${originalPassword}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve password' });
  }
});

// GET version for the modal as implemented previously
app.get('/api/users/forgot-password/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ error: 'Username not found' });
    
    const bytes = CryptoJS.AES.decrypt(user.passwordEncrypted, SECRET_KEY);
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);
    res.json({ password: originalPassword });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve password' });
  }
});

app.post('/api/register', async (req, res) => {
  const { username, email, password, name, batchName } = req.body;
  try {
    const batch = await Batch.findOne({ name: batchName });
    const passwordHash = bcrypt.hashSync(password, 10);
    const passwordEncrypted = CryptoJS.AES.encrypt(password, SECRET_KEY).toString();

    const newUser = new User({
      username,
      email,
      passwordHash,
      passwordEncrypted,
      role: 'student',
      status: 'pending',
      name,
      batchName,
      batch_id: batch ? batch._id : null
    });
    await newUser.save();
    res.json({ message: 'Registration request sent! Please wait for Admin approval.' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed: ' + err.message });
  }
});

app.get('/api/admin/pending-students', authenticate, reqAdmin, async (req, res) => {
  try {
    const pending = await User.find({ role: 'student', status: 'pending' }).lean();
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/approve-student', authenticate, reqAdmin, async (req, res) => {
  const { student_id, action } = req.body; // action: 'approve' or 'reject'
  try {
    if (action === 'approve') {
      await User.findByIdAndUpdate(student_id, { status: 'active' });
      res.json({ message: 'Student approved' });
    } else {
      await User.findByIdAndDelete(student_id);
      res.json({ message: 'Student rejected' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// New Task Requirements: Admin Student Management
app.get('/api/admin/all-students', authenticate, reqAdmin, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name username batchName status createdAt')
      .lean();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/admin/approve/:id', authenticate, reqAdmin, async (req, res) => {
  try {
    const student = await User.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    res.json({ message: 'Student approved successfully', status: student.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// New Student Management API
app.get('/api/users/students', authenticate, reqAdmin, async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).lean();
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/users/students/:id/status', authenticate, reqAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    user.status = user.status === 'active' ? 'pending' : 'active';
    await user.save();
    res.json({ message: `Status updated to ${user.status}`, status: user.status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clean up duplicated or old recovery API
// (Already updated above)

app.get('/api/admin/qr', authenticate, reqAdmin, (req, res) => {
  res.json({ qrCodeId: currentDailyQR });
});

app.post('/api/admin/rotate-qr', authenticate, reqAdmin, (req, res) => {
  currentDailyQR = uuidv4();
  res.json({ qrCodeId: currentDailyQR });
});

app.get('/api/admin/batches', authenticate, reqAdmin, async (req, res) => {
  try {
    const batches = await Batch.find().lean();
    res.json(batches.map(b => ({ ...b, batch_id: b._id.toString() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/batches', authenticate, reqAdmin, async (req, res) => {
  const { name, description } = req.body;
  try {
    const batch = await Batch.create({ name, description });
    res.json({ id: batch._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/students', authenticate, reqAdmin, async (req, res) => {
  const { username, password, name, batch_id } = req.body;
  try {
    const hash = bcrypt.hashSync(password, 10);
    const user = await User.create({
      username,
      password_hash: hash,
      role: 'student',
      name
    });
    res.json({ id: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/exams', authenticate, reqAdmin, async (req, res) => {
  try {
    const exams = await Exam.find().lean();
    res.json(exams.map(e => ({ ...e, exam_id: e._id.toString() })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/exams', authenticate, reqAdmin, async (req, res) => {
  const { batch_id, subject, date, max_marks } = req.body;
  try {
    const exam = await Exam.create({ batch_id, subject, date, max_marks });
    res.json({ id: exam._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/results', authenticate, reqAdmin, async (req, res) => {
  const { exam_id, student_id, score, feedback } = req.body;
  try {
    const result = await Result.create({ exam_id, student_id, score, feedback });
    res.json({ id: result._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/stats', authenticate, reqAdmin, async (req, res) => {
  try {
    const students = await User.countDocuments({ role: 'student', status: 'active' });
    const batches = await Batch.countDocuments();
    const exams = await Exam.countDocuments();
    res.json({ students, batches, exams });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public endpoint for registration
app.get('/api/public/batches', async (req, res) => {
  try {
    const batches = await Batch.find({}, 'name subjects').lean();
    res.json(batches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Updated endpoint for real-time batch view with filtering
app.get('/api/admin/batches/:id/students', authenticate, reqAdmin, async (req, res) => {
  const { date, subject } = req.query;
  try {
    const students = await User.find({
      batch_id: new mongoose.Types.ObjectId(req.params.id),
      role: 'student',
      status: 'active'
    }).lean();

    // Filter attendance by specific date and subject if provided
    const attendanceQuery = {
      student_id: { $in: students.map(s => s._id) },
      date: date || new Date().toISOString().split('T')[0]
    };
    if (subject && subject !== 'All') {
      attendanceQuery.subjectName = subject;
    }

    const attendanceList = await Attendance.find(attendanceQuery).lean();

    const result = students.map(s => {
      const isPresent = attendanceList.some(a => a.student_id.toString() === s._id.toString());
      return {
        _id: s._id,
        name: s.name,
        username: s.username,
        isPresent
      };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post('/api/admin/sessions', authenticate, reqAdmin, async (req, res) => {
  const { batch_id, subjectName, teacher_name, startTime, endTime } = req.body;
  try {
    const batch = await Batch.findById(batch_id);
    if (!batch) return res.status(404).json({ error: 'Batch not found' });

    const qr_code_id = uuidv4();
    const date = new Date().toISOString().split('T')[0];

    const newSession = new Session({
      batch_id,
      batchName: batch.name,
      subjectName,
      teacher_name,
      date,
      startTime,
      endTime,
      qr_code_id
    });
    await newSession.save();

    const signedQR = jwt.sign({
      sessionId: newSession._id,
      batchName: batch.name,
      subjectName,
      date,
      startTime,
      endTime
    }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ ...newSession.toObject(), signedQR });

    // Analytics: Increment classesHeld for this subject
    await Batch.updateOne(
      { _id: batch_id, "subjects.name": subjectName },
      { $inc: { "subjects.$.classesHeld": 1 } }
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Management (Secure Cascade)
app.delete('/api/admin/batches/:id', authenticate, reqAdmin, async (req, res) => {
  const batchId = req.params.id;
  const force = req.query.force === 'true';
  try {
    const studentCount = await User.countDocuments({ batch_id: batchId });
    if (studentCount > 0 && !force) {
      return res.status(409).json({ error: 'Batch has assigned students', studentCount });
    }
    const sessionIds = await Session.find({ batch_id: batchId }).distinct('_id');
    await Attendance.deleteMany({ session_id: { $in: sessionIds } });
    await Session.deleteMany({ batch_id: batchId });
    await User.updateMany({ batch_id: batchId }, { $unset: { batch_id: 1, batchName: 1 } });
    await Batch.findByIdAndDelete(batchId);
    res.json({ message: 'Batch deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk User Actions
app.post('/api/admin/users/bulk-delete', authenticate, reqAdmin, async (req, res) => {
  const { userIds } = req.body;
  try {
    await Attendance.deleteMany({ student_id: { $in: userIds } });
    await Result.deleteMany({ student_id: { $in: userIds } });
    await User.deleteMany({ _id: { $in: userIds } });
    res.json({ message: `${userIds.length} students deleted` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk Batch Update
app.patch('/api/admin/users/bulk-batch-update', authenticate, reqAdmin, async (req, res) => {
  const { updates } = req.body; // Array of { userId, batch_id }
  try {
    const promises = updates.map(async (upd) => {
      const batch = await Batch.findById(upd.batch_id);
      return User.findByIdAndUpdate(upd.userId, {
        batch_id: batch ? batch._id : null,
        batchName: batch ? batch.name : 'Unassigned'
      }, { new: true });
    });
    await Promise.all(promises);
    res.json({ message: 'Bulk batch update successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Refined Attendance Summary (Left Join logic)
app.get('/api/admin/attendance-summary/:sessionId', authenticate, reqAdmin, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Step 1: Get all students in the batch (EXPECTED LIST)
    const batchStudents = await User.find({
      batch_id: session.batch_id,
      role: 'student',
      status: 'active'
    }).select('name username').lean();

    // Step 2: Get all attendance records for this session (ACTUAL LIST)
    const attendance = await Attendance.find({ session_id: session._id }).lean();
    const attendedIds = new Set(attendance.map(a => a.student_id.toString()));

    // Step 3: Build the Comparison Roster
    const roster = batchStudents.map(student => {
      const record = attendance.find(a => a.student_id.toString() === student._id.toString());
      return {
        ...student,
        isPresent: attendedIds.has(student._id.toString()),
        scanTime: record ? record.timestamp : null
      };
    });

    res.json(roster);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Batch (Rename/Subjects)
app.put('/api/admin/batches/:id', authenticate, reqAdmin, async (req, res) => {
  const { name, subjects } = req.body; // subjects is array of names (strings)
  try {
    const oldBatch = await Batch.findById(req.params.id);
    if (!oldBatch) return res.status(404).json({ error: 'Batch not found' });

    // Preserve existing counts if subject name matches
    const updatedSubjects = subjects.map(sName => {
      const existing = oldBatch.subjects.find(s => s.name === sName);
      return { name: sName, classesHeld: existing ? existing.classesHeld : 0 };
    });

    const updatedBatch = await Batch.findByIdAndUpdate(req.params.id, 
      { name, subjects: updatedSubjects }, 
      { new: true }
    );

    if (oldBatch.name !== name) {
      await User.updateMany({ batch_id: req.params.id }, { batchName: name });
    }
    res.json(updatedBatch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Delete Student
app.delete('/api/admin/users/:id', authenticate, reqAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    await Attendance.deleteMany({ student_id: userId });
    await Result.deleteMany({ student_id: userId });
    await User.findByIdAndDelete(userId);
    res.json({ message: 'Student and related data deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update User Batch
app.patch('/api/admin/users/:id/batch', authenticate, reqAdmin, async (req, res) => {
  const { batch_id } = req.body;
  try {
    const batch = await Batch.findById(batch_id);
    const update = {
      batch_id: batch ? batch._id : null,
      batchName: batch ? batch.name : 'Unassigned'
    };
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List Sessions
app.get('/api/admin/sessions', authenticate, reqAdmin, async (req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 }).lean();
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/sessions/:id', authenticate, reqAdmin, async (req, res) => {
  try {
    await Session.findByIdAndDelete(req.params.id);
    await Attendance.deleteMany({ session_id: req.params.id });
    res.json({ message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/sessions/:id/qr', authenticate, reqAdmin, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const timestamp = Date.now();
    // Signed string containing sessionId and timestamp
    const signedData = jwt.sign({
      sessionId: session._id,
      qrCodeId: session.qr_code_id,
      timestamp
    }, JWT_SECRET, { expiresIn: '60s' });

    res.json({ signedQR: signedData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/student/qr-login', async (req, res) => {
  const { qrCodeId, username, password } = req.body;
  
  let isValidQR = (qrCodeId === currentDailyQR);

  // If not daily QR, try decoding as session JWT
  if (!isValidQR) {
    try {
      jwt.verify(qrCodeId, JWT_SECRET);
      isValidQR = true;
    } catch (e) {
      // Not a valid JWT or daily QR
    }
  }

  if (!isValidQR) {
    return res.status(400).json({ error: 'Invalid or expired QR code' });
  }
  try {
    const user = await User.findOne({ username, role: 'student' });
    if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const today = new Date().toISOString().split('T')[0];
    const existingCheckin = await Attendance.findOne({ student_id: user._id, date: today });
    if (!existingCheckin) {
      await Attendance.create({ student_id: user._id, date: today, status: 'Present' });
    }

    const token = jwt.sign({ user_id: user._id.toString(), role: user.role, name: user.name }, JWT_SECRET);
    res.json({ token, role: user.role, name: user.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/student/progress', authenticate, async (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });

  try {
    const user = await User.findById(req.user.user_id).populate('batch_id');
    if (!user) return res.status(404).json({ error: 'User not found' });

    const results = await Result.find({ student_id: req.user.user_id })
      .populate('exam_id')
      .sort({ 'exam_id.date': 1 })
      .lean();

    const attendance = await Attendance.find({ student_id: req.user.user_id }).lean();
    
    // Subject-wise breakdown
    const subjectAttendance = {};
    attendance.forEach(a => {
      subjectAttendance[a.subjectName] = (subjectAttendance[a.subjectName] || 0) + 1;
    });

    const formattedResults = results.map(r => ({
      score: r.score,
      max_marks: r.exam_id ? r.exam_id.max_marks : 0,
      subject: r.exam_id ? r.exam_id.subject : 'Unknown',
      date: r.exam_id ? r.exam_id.date : 'Unknown'
    }));

    const classesMap = {};
    if (user.batch_id && user.batch_id.subjects) {
      user.batch_id.subjects.forEach(s => {
        classesMap[s.name] = s.classesHeld || 0;
      });
    }

    res.json({ 
      results: formattedResults, 
      attendanceDays: attendance.length,
      subjectAttendance,
      batchClasses: classesMap
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware to check if the session is still valid (Single Device Only)
const validateSession = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.user_id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    // Check if the session_uuid in the JWT matches the one in MongoDB
    if (req.user.session_uuid !== user.currentSessionId) {
      return res.status(401).json({ error: 'Logged out: Your account is being used on another device.' });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: 'Session validation error' });
  }
};

app.post('/api/attendance/verify', authenticate, async (req, res) => {
  const { signedQR } = req.body;
  try {
    const user = await User.findById(req.user.user_id);
    if (!user || user.status !== 'active') {
      return res.status(403).json({ error: 'Account not active' });
    }
    const decoded = jwt.verify(signedQR, JWT_SECRET);

    // Usecase 1.3: Verify student belongs to the same batchName
    if (user.batchName !== decoded.batchName) {
      return res.status(403).json({ error: `Access Denied: You belong to batch ${user.batchName}, but this QR is for ${decoded.batchName}.` });
    }

    const session = await Session.findById(decoded.sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found or expired' });

    // Check if already marked
    const existing = await Attendance.findOne({ student_id: user._id, session_id: session._id });
    if (existing) return res.status(400).json({ error: 'Attendance already marked for this session' });

    const attendance = new Attendance({
      student_id: user._id,
      session_id: session._id,
      batchName: decoded.batchName,
      subjectName: decoded.subjectName,
      date: decoded.date,
      time: `${decoded.startTime} - ${decoded.endTime}`,
      status: 'Present'
    });
    await attendance.save();

    res.json({
      message: 'Attendance Mark Success',
      subjectName: decoded.subjectName,
      date: decoded.date,
      timeRange: `${decoded.startTime} - ${decoded.endTime}`
    });
  } catch (err) {
    res.status(500).json({ error: 'Verification failed: ' + err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.clear();
  console.log('\x1b[36m%s\x1b[0m', '--------------------------------------------------');
  console.log('\x1b[35m%s\x1b[0m', '  🚀 PACE ATTENDANCE SYSTEM - BACKEND IS LIVE');
  console.log('\x1b[36m%s\x1b[0m', '--------------------------------------------------');
  console.log(`  > Main Window: http://localhost:3000`);
  console.log(`  > API Status:  http://localhost:${PORT}/api/health`);
  console.log('\x1b[36m%s\x1b[0m', '--------------------------------------------------');
  console.log('  Waiting for student check-ins...');
});
