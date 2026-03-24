import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminExams = () => {
  const { token } = useAuth();
  const [exams, setExams] = useState([]);
  const [batches, setBatches] = useState([]);
  const [message, setMessage] = useState('');
  
  // Exam Form
  const [batchId, setBatchId] = useState('');
  const [subject, setSubject] = useState('');
  const [date, setDate] = useState('');
  const [maxMarks, setMaxMarks] = useState('');

  // Result Form
  const [examId, setExamId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [resultMsg, setResultMsg] = useState('');

  const fetchData = () => {
    fetch('http://localhost:3000/api/admin/exams', { headers: { 'Authorization': `Bearer ${token}` }})
      .then(res => res.json()).then(setExams).catch(console.error);
    fetch('http://localhost:3000/api/admin/batches', { headers: { 'Authorization': `Bearer ${token}` }})
      .then(res => res.json()).then(setBatches).catch(console.error);
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/admin/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ batch_id: batchId, subject, date, max_marks: maxMarks })
      });
      if (!res.ok) throw new Error('Failed to create exam');
      setMessage('Exam created successfully');
      setSubject(''); setDate(''); setMaxMarks('');
      fetchData();
    } catch (err) { setMessage(err.message); }
  };

  const handleUploadResult = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/admin/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ exam_id: examId, student_id: studentId, score, feedback })
      });
      if (!res.ok) throw new Error('Failed to upload result');
      setResultMsg('Result uploaded successfully');
      setStudentId(''); setScore(''); setFeedback('');
    } catch (err) { setResultMsg(err.message); }
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-brand">Pace Admin</div>
        <Link to="/admin/dashboard">
          <button style={{ backgroundColor: 'var(--accent-color)', color: 'var(--text-dark)' }}>Back to Dashboard</button>
        </Link>
      </nav>

      <div className="content">
        <h2>Manage Exams & Results</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          <div className="card">
            <h3>Create Exam</h3>
            {message && <div className="alert">{message}</div>}
            <form onSubmit={handleCreateExam}>
              <div className="mb-2">
                <label>Select Batch</label>
                <select value={batchId} onChange={e => setBatchId(e.target.value)} required>
                  <option value="">-- Select Batch --</option>
                  {batches.map(b => (
                    <option key={b.batch_id} value={b.batch_id}>{b.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-2">
                <label>Subject</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} required />
              </div>
              <div className="mb-2">
                <label>Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label>Maximum Marks</label>
                <input type="number" value={maxMarks} onChange={e => setMaxMarks(e.target.value)} required />
              </div>
              <button type="submit" style={{ width: '100%' }}>Create Exam</button>
            </form>
          </div>

          <div className="card">
            <h3>Upload Student Result</h3>
            {resultMsg && <div className="alert">{resultMsg}</div>}
            <form onSubmit={handleUploadResult}>
              <div className="mb-2">
                <label>Select Exam</label>
                <select value={examId} onChange={e => setExamId(e.target.value)} required>
                  <option value="">-- Select Exam --</option>
                  {exams.map(e => (
                    <option key={e.exam_id} value={e.exam_id}>{e.subject} ({e.date})</option>
                  ))}
                </select>
              </div>
              <div className="mb-2">
                <label>Student ID</label>
                <input type="number" value={studentId} onChange={e => setStudentId(e.target.value)} required />
              </div>
              <div className="mb-2">
                <label>Score</label>
                <input type="number" value={score} onChange={e => setScore(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label>Feedback (Optional)</label>
                <input type="text" value={feedback} onChange={e => setFeedback(e.target.value)} />
              </div>
              <button type="submit" style={{ width: '100%', backgroundColor: 'var(--text-dark)' }}>Upload Result</button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminExams;
