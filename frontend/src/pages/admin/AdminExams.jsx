import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, Plus, Upload, ArrowLeft, Loader2, Award } from 'lucide-react';
import axios from 'axios';

const AdminExams = () => {
  const { token } = useAuth();
  const [exams, setExams] = useState([]);
  const [batches, setBatches] = useState([]);
  const [message, setMessage] = useState('');
  const [loadingExam, setLoadingExam] = useState(false);
  
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
  const [loadingResult, setLoadingResult] = useState(false);

  const fetchData = () => {
    axios.get(`http://${window.location.hostname}:5000/api/admin/exams`, { headers: { 'Authorization': `Bearer ${token}` }})
      .then(res => setExams(res.data)).catch(console.error);
    axios.get(`http://${window.location.hostname}:5000/api/admin/batches`, { headers: { 'Authorization': `Bearer ${token}` }})
      .then(res => setBatches(res.data)).catch(console.error);
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    setLoadingExam(true);
    try {
      await axios.post(`http://${window.location.hostname}:5000/api/admin/exams`, 
        { batch_id: batchId, subject, date, max_marks: maxMarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Exam created successfully');
      setSubject(''); setDate(''); setMaxMarks('');
      fetchData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { setMessage(err.response?.data?.error || 'Failed to create exam'); }
    finally { setLoadingExam(false); }
  };

  const handleUploadResult = async (e) => {
    e.preventDefault();
    setLoadingResult(true);
    try {
      await axios.post(`http://${window.location.hostname}:5000/api/admin/results`, 
        { exam_id: examId, student_id: studentId, score, feedback },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResultMsg('Result uploaded successfully');
      setStudentId(''); setScore(''); setFeedback('');
      setTimeout(() => setResultMsg(''), 3000);
    } catch (err) { setResultMsg(err.response?.data?.error || 'Failed to upload result'); }
    finally { setLoadingResult(false); }
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">Pace Admin</div>
        <Link to="/admin/dashboard">
          <button className="secondary"><ArrowLeft size={18} /> Dashboard</button>
        </Link>
      </nav>

      <div className="content">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList size={28} color="var(--primary)" />
          <h1>Exams & Performance</h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
            <h3><Plus size={18} /> Create Exam</h3>
            {message && <div className={`alert ${message.includes('success') ? 'success-alert' : ''}`}>{message}</div>}
            <form onSubmit={handleCreateExam} style={{ marginTop: '1.5rem' }}>
              <select value={batchId} onChange={e => setBatchId(e.target.value)} required>
                <option value="">-- Select Batch --</option>
                {batches.map(b => (
                  <option key={b.batch_id} value={b.batch_id}>{b.name}</option>
                ))}
              </select>
              <input type="text" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} required />
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
              <input type="number" placeholder="Maximum Marks" value={maxMarks} onChange={e => setMaxMarks(e.target.value)} required />
              <button type="submit" style={{ width: '100%' }} disabled={loadingExam}>
                {loadingExam ? <Loader2 className="animate-spin" /> : "Schedule Exam"}
              </button>
            </form>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
            <h3><Upload size={18} /> Upload Result</h3>
            {resultMsg && <div className={`alert ${resultMsg.includes('success') ? 'success-alert' : ''}`}>{resultMsg}</div>}
            <form onSubmit={handleUploadResult} style={{ marginTop: '1.5rem' }}>
              <select value={examId} onChange={e => setExamId(e.target.value)} required>
                <option value="">-- Select Exam --</option>
                {exams.map(e => (
                  <option key={e.exam_id} value={e.exam_id}>{e.subject} ({e.date})</option>
                ))}
              </select>
              <input type="text" placeholder="Student MongoDB ID" value={studentId} onChange={e => setStudentId(e.target.value)} required />
              <input type="number" placeholder="Obtained Score" value={score} onChange={e => setScore(e.target.value)} required />
              <input type="text" placeholder="Teacher Feedback (Optional)" value={feedback} onChange={e => setFeedback(e.target.value)} />
              <button type="submit" className="secondary" style={{ width: '100%' }} disabled={loadingResult}>
                {loadingResult ? <Loader2 className="animate-spin" /> : <><Award size={18} /> Publish Result</>}
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export default AdminExams;
