import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, ArrowLeft, CheckCircle, XCircle, Search, Trash2, BarChart2, Calendar, QrCode, Plus, UserCheck, BookOpen, ChevronRight, History, Check, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { QRCodeCanvas } from 'qrcode.react';

export default function AdminBatchDetails() {
  const { id: initialBatchId } = useParams();
  const { token } = useAuth();
  
  // Data States
  const [allBatches, setAllBatches] = useState([]);
  const [batchData, setBatchData] = useState(null);
  const [students, setStudents] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [attendanceReport, setAttendanceReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Selection Hierarchy
  const [selectedBatchId, setSelectedBatchId] = useState(initialBatchId);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState('');
  
  // Search
  const [searchTerm, setSearchTerm] = useState('');
  
  // Session Creation Form
  const [sessionSubject, setSessionSubject] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [generatedQR, setGeneratedQR] = useState('');
  const [creatingSession, setCreatingSession] = useState(false);

  const fetchData = async () => {
    try {
      const [batchRes, studentRes, sessionRes] = await Promise.all([
        axios.get(`http://${window.location.hostname}:5000/api/admin/batches`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://${window.location.hostname}:5000/api/admin/all-students`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://${window.location.hostname}:5000/api/admin/sessions`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      
      setAllBatches(batchRes.data);
      const currentBatch = batchRes.data.find(b => b._id === selectedBatchId || b.batch_id === selectedBatchId);
      if (currentBatch) {
        setBatchData(currentBatch);
        if (currentBatch.subjects?.length > 0 && !selectedSubject) setSelectedSubject(currentBatch.subjects[0].name);
        if (currentBatch.subjects?.length > 0 && !sessionSubject) setSessionSubject(currentBatch.subjects[0].name);
        setStudents(studentRes.data.filter(s => s.batch_id === (currentBatch._id || currentBatch.batch_id)));
        setSessions((sessionRes.data || []).filter(s => s.batch_id === (currentBatch._id || currentBatch.batch_id)));
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchAttendanceReport = async () => {
    if (!selectedSessionId) return alert("Select a session first");
    setAttendanceReport(null); // Reset for loading state
    try {
      const res = await axios.get(`http://${window.location.hostname}:5000/api/admin/attendance-summary/${selectedSessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAttendanceReport(res.data);
    } catch (err) { alert("Failed to fetch attendance"); }
  };

  useEffect(() => { fetchData(); }, [selectedBatchId, token]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    setCreatingSession(true);
    try {
      const res = await axios.post(`http://${window.location.hostname}:5000/api/admin/sessions`, {
        batch_id: selectedBatchId,
        subjectName: sessionSubject,
        teacher_name: teacherName,
        sessionDate,
        startTime,
        endTime
      }, { headers: { Authorization: `Bearer ${token}` } });
      setGeneratedQR(res.data.signedQR);
      fetchData();
    } catch (err) { alert("Failed to create session"); }
    finally { setCreatingSession(false); }
  };

  const handleDeleteSession = async (sid) => {
    if (!window.confirm("Delete this session?")) return;
    try {
      await axios.delete(`http://${window.location.hostname}:5000/api/admin/sessions/${sid}`, { headers: { Authorization: `Bearer ${token}` } });
      setSessions(sessions.filter(s => s._id !== sid));
    } catch (err) { alert("Delete failed"); }
  };

  const filteredStudents = students.filter(s =>
    (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;

  return (
    <div className="app-container" style={{ backgroundColor: '#F3F4F6', minHeight: '100vh' }}>
      <nav className="navbar" style={{ backgroundColor: 'white', borderBottom: '1px solid #E5E7EB', padding: '1rem 2rem' }}>
        <div className="navbar-brand" style={{ color: '#4F46E5', fontWeight: 800, fontSize: '1.5rem' }}>Pace Admin</div>
        <Link to="/admin/batches">
          <button className="secondary" style={{ borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer' }}>
            <ArrowLeft size={18} /> Back to Batches
          </button>
        </Link>
      </nav>

      <main style={{ display: 'flex', height: 'calc(100vh - 70px)' }}>
        {/* LEFT SIDE */}
        <div style={{ flex: '0 0 60%', padding: '2rem', overflowY: 'auto', borderRight: '1px solid #E5E7EB' }}>
          <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'white', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px', color: '#1F2937' }}>
              <BarChart2 color="#4F46E5" /> Hierarchical Attendance Review - {batchData?.name || 'Loading...'}
            </h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.8fr 0.6fr', gap: '1rem', alignItems: 'flex-end' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', marginBottom: '6px', display: 'block' }}>1. SUBJECT</label>
                <select value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setSelectedSessionId(''); setAttendanceReport(null); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}>
                  {batchData?.subjects?.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', marginBottom: '6px', display: 'block' }}>2. SESSION</label>
                <select value={selectedSessionId} onChange={e => { setSelectedSessionId(e.target.value); setAttendanceReport(null); }} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}>
                  <option value="">Choose session...</option>
                  {sessions.filter(s => s.subjectName === selectedSubject).map(s => (
                    <option key={s._id} value={s._id}>{new Date(s.createdAt).toLocaleDateString()} @ {s.startTime}</option>
                  ))}
                </select>
              </div>
              <button 
                onClick={fetchAttendanceReport} 
                disabled={!selectedSessionId}
                style={{ padding: '10px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', opacity: selectedSessionId ? 1 : 0.5 }}
              >
                Fetch Attendance
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                <BookOpen size={18} color="#4F46E5" /> Batch Subjects
              </h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {batchData?.subjects?.map(sub => (
                  <div key={sub.name} style={{ padding: '12px', background: '#F9FAFB', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{sub.name}</span>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#4F46E5', background: '#EEF2FF', padding: '2px 8px', borderRadius: '12px' }}>
                      {sub.classesHeld || 0} Classes
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: '1.5rem', background: 'white', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                <QrCode size={18} color="#4F46E5" /> Session Creation
              </h3>
              <form onSubmit={handleCreateSession} style={{ display: 'grid', gap: '1rem' }}>
                <select value={sessionSubject} onChange={e => setSessionSubject(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }}>
                  {batchData?.subjects?.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}
                </select>
                <input type="text" placeholder="Teacher Name" value={teacherName} onChange={e => setTeacherName(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                <input type="date" value={sessionDate} onChange={e => setSessionDate(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                  <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB' }} />
                </div>
                <button type="submit" disabled={creatingSession} style={{ padding: '12px', background: '#4F46E5', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                  {creatingSession ? 'Creating...' : 'Generate Session QR'}
                </button>
              </form>
            </div>
          </div>

          <AnimatePresence>
            {generatedQR && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '2rem', background: '#EEF2FF', borderRadius: '20px', border: '2px dashed #4F46E5', textAlign: 'center' }}>
                <p style={{ fontWeight: 800, color: '#4F46E5', marginBottom: '1rem' }}>SCAN TO MARK PRESENT: {sessionSubject}</p>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '16px', display: 'inline-block', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                  <QRCodeCanvas value={generatedQR} size={200} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT SIDE */}
        <div style={{ flex: '0 0 40%', padding: '2rem', display: 'flex', flexDirection: 'column', background: 'white' }}>
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
               {attendanceReport ? <History size={20} color="#10B981" /> : <Users size={20} color="#4F46E5" />}
               {attendanceReport ? 'Attendance List' : 'Batch Roster'}
            </h3>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ padding: '6px 12px 6px 34px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px' }} />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
             {attendanceReport ? (
               <div style={{ display: 'grid', gap: '10px' }}>
                 {attendanceReport.map(s => (
                   <motion.div key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '12px', borderRadius: '12px', border: '1px solid #F3F4F6', background: s.isPresent ? '#F0FDF4' : '#FEF2F2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                       <div style={{ fontWeight: 700, color: s.isPresent ? '#166534' : '#991B1B' }}>{s.name}</div>
                       <div style={{ fontSize: '11px', color: '#6B7280' }}>@{s.username} {s.scanTime && `• ${new Date(s.scanTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}</div>
                     </div>
                     {s.isPresent ? <CheckCircle size={20} color="#10B981" /> : <XCircle size={20} color="#EF4444" />}
                   </motion.div>
                 ))}
               </div>
             ) : (
               <div style={{ display: 'grid', gap: '10px' }}>
                 {filteredStudents.map(s => (
                   <div key={s._id} style={{ padding: '12px', borderRadius: '12px', background: '#F9FAFB', border: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                       <div style={{ fontWeight: 600 }}>{s.name}</div>
                       <div style={{ fontSize: '11px', color: '#6B7280' }}>@{s.username}</div>
                     </div>
                     <span style={{ fontSize: '10px', fontWeight: 800, color: s.status === 'active' ? '#10B981' : '#6B7280', background: 'white', padding: '2px 8px', borderRadius: '10px', border: '1px solid #E5E7EB' }}>
                       {s.status.toUpperCase()}
                     </span>
                   </div>
                 ))}
                 {filteredStudents.length === 0 && <p style={{ textAlign: 'center', color: '#94A3B8', marginTop: '2rem' }}>No students in this batch.</p>}
               </div>
             )}
          </div>
        </div>
      </main>
    </div>
  );
}
