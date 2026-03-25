import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Users, Filter, CheckCircle, Clock, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminStudents = () => {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [filterBatch, setFilterBatch] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, batchesRes] = await Promise.all([
        axios.get(`http://${window.location.hostname}:5000/api/users/students`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`http://${window.location.hostname}:5000/api/admin/batches`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setStudents(studentsRes.data);
      setBatches(batchesRes.data);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const res = await axios.patch(`http://${window.location.hostname}:5000/api/users/students/${id}/status`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(students.map(s => s._id === id ? { ...s, status: res.data.status } : s));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const filteredStudents = filterBatch === 'All' 
    ? students 
    : students.filter(s => s.batchName === filterBatch || (s.batch_id && s.batch_id.name === filterBatch));

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '40px', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
        <h2 style={{ color: '#4F46E5', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Users size={28} /> Student Management
        </h2>
        <Link to="/admin/dashboard"><button style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid #E2E8F0', backgroundColor: 'white', cursor: 'pointer' }}>Back to Dashboard</button></Link>
      </nav>

      <div className="card" style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3>Student List</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Filter size={18} color="#64748B" />
            <select 
              value={filterBatch} 
              onChange={e => setFilterBatch(e.target.value)}
              style={{ padding: '8px 16px', borderRadius: '10px', border: '1px solid #E2E8F0', outline: 'none' }}
            >
              <option value="All">All Batches</option>
              {batches.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
            </select>
          </div>
        </div>

        {loading ? <p>Loading students...</p> : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                  <th style={{ padding: '16px', color: '#64748B', fontWeight: '600' }}>Name</th>
                  <th style={{ padding: '16px', color: '#64748B', fontWeight: '600' }}>Username</th>
                  <th style={{ padding: '16px', color: '#64748B', fontWeight: '600' }}>Batch</th>
                  <th style={{ padding: '16px', color: '#64748B', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '16px', color: '#64748B', fontWeight: '600' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <motion.tr 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    key={student._id} 
                    style={{ borderBottom: '1px solid #F1F5F9' }}
                  >
                    <td style={{ padding: '16px', fontWeight: '500' }}>{student.name}</td>
                    <td style={{ padding: '16px', color: '#64748B' }}>{student.username}</td>
                    <td style={{ padding: '16px' }}>{student.batchName || (student.batch_id && student.batch_id.name)}</td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ 
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: '600',
                        backgroundColor: student.status === 'active' ? '#DCFCE7' : '#FEF2F2',
                        color: student.status === 'active' ? '#166534' : '#991B1B'
                      }}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <button 
                        onClick={() => toggleStatus(student._id)}
                        style={{ 
                          padding: '6px 12px', 
                          borderRadius: '8px', 
                          border: 'none', 
                          backgroundColor: student.status === 'active' ? '#F1F5F9' : '#4F46E5', 
                          color: student.status === 'active' ? '#64748B' : 'white',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '600'
                        }}
                      >
                        {student.status === 'active' ? 'Mark Pending' : 'Approve Student'}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && <p style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>No students found in this batch.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminStudents;
