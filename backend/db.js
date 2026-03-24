const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'database.sqlite'));

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'student')),
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS Batches (
    batch_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS StudentsBatches (
    student_id INTEGER,
    batch_id INTEGER,
    FOREIGN KEY(student_id) REFERENCES Users(user_id),
    FOREIGN KEY(batch_id) REFERENCES Batches(batch_id),
    PRIMARY KEY(student_id, batch_id)
  );

  CREATE TABLE IF NOT EXISTS Attendance (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER,
    date TEXT NOT NULL,
    status TEXT NOT NULL,
    FOREIGN KEY(student_id) REFERENCES Users(user_id)
  );

  CREATE TABLE IF NOT EXISTS Exams (
    exam_id INTEGER PRIMARY KEY AUTOINCREMENT,
    batch_id INTEGER,
    subject TEXT NOT NULL,
    date TEXT NOT NULL,
    max_marks INTEGER NOT NULL,
    FOREIGN KEY(batch_id) REFERENCES Batches(batch_id)
  );

  CREATE TABLE IF NOT EXISTS Results (
    result_id INTEGER PRIMARY KEY AUTOINCREMENT,
    exam_id INTEGER,
    student_id INTEGER,
    score INTEGER NOT NULL,
    feedback TEXT,
    FOREIGN KEY(exam_id) REFERENCES Exams(exam_id),
    FOREIGN KEY(student_id) REFERENCES Users(user_id)
  );
`);

// Seed Admin User
const bcrypt = require('bcrypt');
const getAdmin = db.prepare('SELECT * FROM Users WHERE role = ?').get('admin');

if (!getAdmin) {
  const hash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO Users (username, password_hash, role, name) VALUES (?, ?, ?, ?)').run('admin', hash, 'admin', 'Administrator');
  console.log('Seeded default admin (admin / admin123)');
}

module.exports = db;
