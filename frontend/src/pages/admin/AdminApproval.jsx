import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, UserCheck, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const AdminApproval = () => {
  const { token } = useAuth();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchPending = async () => {
    try {
      const res = await axios.get(`http://${window.location.hostname}:5000/api/admin/pending-students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPending(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, [token]);

  const handleAction = async (student_id, action) => {
    try {
      await axios.post(`http://${window.location.hostname}:5000/api/admin/approve-student`, 
        { student_id, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage(`Student ${action === 'approve' ? 'approved' : 'rejected'}`);
      fetchPending();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('Action failed');
    }
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <UserCheck size={32} color="var(--primary)" />
          <h1>Registration Requests</h1>
        </div>

        {message && <div className={`alert ${message.includes('approved') ? 'success-alert' : ''}`}>{message}</div>}

        {loading ? <p>Loading requests...</p> : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            <AnimatePresence>
              {pending.length === 0 ? (
                <p className="text-muted">No pending requests at the moment.</p>
              ) : pending.map(student => (
                <motion.div 
                  key={student._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="card"
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem' }}
                >
                  <div>
                    <h3 style={{ margin: 0 }}>{student.name}</h3>
                    <p className="text-muted" style={{ margin: 0 }}>{student.username} • {student.email}</p>
                  </div>
                  <div className="flex gap-4">
                    <button 
                      style={{ backgroundColor: 'var(--success)' }} 
                      onClick={() => handleAction(student._id, 'approve')}
                    >
                      <Check size={18} /> Approve
                    </button>
                    <button 
                      style={{ backgroundColor: 'var(--danger)' }} 
                      onClick={() => handleAction(student._id, 'reject')}
                    >
                      <X size={18} /> Reject
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminApproval;
