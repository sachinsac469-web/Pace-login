const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = 'super-secret-key-change-in-prod';

// Global store for the current daily QR code
let currentDailyQR = uuidv4();

setInterval(() => {
  currentDailyQR = uuidv4();
  console.log('Rotated daily QR code');
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

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM Users WHERE username = ?').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ user_id: user.user_id, role: user.role, name: user.name }, JWT_SECRET);
  res.json({ token, role: user.role, name: user.name });
});

app.get('/api/admin/qr', authenticate, reqAdmin, (req, res) => {
  res.json({ qrCodeId: currentDailyQR });
});

app.post('/api/admin/rotate-qr', authenticate, reqAdmin, (req, res) => {
  currentDailyQR = uuidv4();
  res.json({ qrCodeId: currentDailyQR });
});

app.get('/api/admin/batches', authenticate, reqAdmin, (req, res) => {
  const batches = db.prepare('SELECT * FROM Batches').all();
  res.json(batches);
});

app.post('/api/admin/batches', authenticate, reqAdmin, (req, res) => {
  const { name, description } = req.body;
  const result = db.prepare('INSERT INTO Batches (name, description) VALUES (?, ?)').run(name, description);
  res.json({ id: result.lastInsertRowid });
});

app.post('/api/admin/students', authenticate, reqAdmin, (req, res) => {
  const { username, password, name, batch_id } = req.body;
  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO Users (username, password_hash, role, name) VALUES (?, ?, ?, ?)').run(username, hash, 'student', name);
  if (batch_id) {
    db.prepare('INSERT INTO StudentsBatches (student_id, batch_id) VALUES (?, ?)').run(result.lastInsertRowid, batch_id);
  }
  res.json({ id: result.lastInsertRowid });
});

app.get('/api/admin/exams', authenticate, reqAdmin, (req, res) => {
  const exams = db.prepare('SELECT * FROM Exams').all();
  res.json(exams);
});

app.post('/api/admin/exams', authenticate, reqAdmin, (req, res) => {
  const { batch_id, subject, date, max_marks } = req.body;
  const result = db.prepare('INSERT INTO Exams (batch_id, subject, date, max_marks) VALUES (?, ?, ?, ?)').run(batch_id, subject, date, max_marks);
  res.json({ id: result.lastInsertRowid });
});

app.post('/api/admin/results', authenticate, reqAdmin, (req, res) => {
  const { exam_id, student_id, score, feedback } = req.body;
  const result = db.prepare('INSERT INTO Results (exam_id, student_id, score, feedback) VALUES (?, ?, ?, ?)').run(exam_id, student_id, score, feedback);
  res.json({ id: result.lastInsertRowid });
});

app.get('/api/admin/stats', authenticate, reqAdmin, (req, res) => {
    const students = db.prepare("SELECT count(*) as count FROM Users WHERE role = 'student'").get().count;
    const batches = db.prepare("SELECT count(*) as count FROM Batches").get().count;
    const exams = db.prepare("SELECT count(*) as count FROM Exams").get().count;
    res.json({ students, batches, exams });
});

app.post('/api/student/qr-login', (req, res) => {
  const { qrCodeId, username, password } = req.body;
  if (qrCodeId !== currentDailyQR) {
    return res.status(400).json({ error: 'Invalid or expired QR code' });
  }
  const user = db.prepare('SELECT * FROM Users WHERE username = ? AND role = "student"').get(username);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const today = new Date().toISOString().split('T')[0];
  const existingCheckin = db.prepare('SELECT * FROM Attendance WHERE student_id = ? AND date = ?').get(user.user_id, today);
  if (!existingCheckin) {
      db.prepare('INSERT INTO Attendance (student_id, date, status) VALUES (?, ?, ?)').run(user.user_id, today, 'Present');
  }

  const token = jwt.sign({ user_id: user.user_id, role: user.role, name: user.name }, JWT_SECRET);
  res.json({ token, role: user.role, name: user.name });
});

app.get('/api/student/progress', authenticate, (req, res) => {
  if (req.user.role !== 'student') return res.status(403).json({ error: 'Forbidden' });
  
  const results = db.prepare(`
    SELECT r.score, e.max_marks, e.subject, e.date 
    FROM Results r 
    JOIN Exams e ON r.exam_id = e.exam_id 
    WHERE r.student_id = ?
    ORDER BY e.date ASC
  `).all();

  const totalDays = db.prepare('SELECT count(*) as total FROM Attendance WHERE student_id = ?').get(req.user.user_id).total;
  res.json({ results, attendanceDays: totalDays });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
