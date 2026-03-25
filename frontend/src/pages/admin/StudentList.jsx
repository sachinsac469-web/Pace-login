import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle, Clock, Search, ArrowLeft, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

export default function StudentList() {
  const { token } = useAuth();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBatch, setFilterBatch] = useState('All');
  const [loading, setLoading] = useState(true);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [bulkTargetBatch, setBulkTargetBatch] = useState('');
  const [pendingChanges, setPendingChanges] = useState({});

  const toggleSelect = (id) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };

  const handleBatchChange = (userId, batchId) => {
    setPendingChanges(prev => ({ ...prev, [userId]: batchId }));
  };

  const handleBulkUpdate = async () => {
    const updates = Object.entries(pendingChanges).map(([userId, batch_id]) => ({ userId, batch_id }));
    if (updates.length === 0) return;
    setLoading(true);
    try {
      await axios.patch(`http://${window.location.hostname}:5000/api/admin/users/bulk-batch-update`, { updates }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const updatedStudents = students.map(s => {
        if (pendingChanges[s._id]) {
          const batch = availableBatches.find(b => b._id === pendingChanges[s._id]);
          return { ...s, batch_id: pendingChanges[s._id], batchName: batch ? batch.name : 'Unassigned' };
        }
        return s;
      });
      setStudents(updatedStudents);
      setPendingChanges({});
    } catch (err) { alert("Update failed: " + (err.response?.data?.error || err.message)); }
    finally { setLoading(false); }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedUsers.length} students?`)) return;
    try {
      await axios.post(`http://${window.location.hostname}:5000/api/admin/users/bulk-delete`, { userIds: selectedUsers }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(students.filter(s => !selectedUsers.includes(s._id)));
      setSelectedUsers([]);
    } catch (err) { alert("Bulk delete failed"); }
  };

  const handleBulkMove = async () => {
    if (!bulkTargetBatch) return alert("Select a batch");
    try {
      await axios.post(`http://${window.location.hostname}:5000/api/admin/users/bulk-move`, { 
        userIds: selectedUsers, 
        batch_id: bulkTargetBatch 
      }, { headers: { Authorization: `Bearer ${token}` } });
      const batchName = availableBatches.find(b => b._id === bulkTargetBatch)?.name;
      setStudents(students.map(s => selectedUsers.includes(s._id) ? { ...s, batch_id: bulkTargetBatch, batchName } : s));
      setSelectedUsers([]);
      setBulkTargetBatch('');
    } catch (err) { alert("Bulk move failed"); }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const [studentRes, batchRes] = await Promise.all([
        axios.get(`http://${window.location.hostname}:5000/api/admin/all-students`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`http://${window.location.hostname}:5000/api/admin/batches`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setStudents(studentRes.data);
      setAvailableBatches(batchRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleApprove = async (id) => {
    try {
      await axios.patch(`http://${window.location.hostname}:5000/api/admin/approve/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(students.map(s => s._id === id ? { ...s, status: 'active' } : s));
    } catch (err) { alert("Approval failed"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`http://${window.location.hostname}:5000/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(students.filter(s => s._id !== id));
    } catch (err) { alert("Delete failed"); }
  };

  const batches = ['All', ...new Set(availableBatches.map(b => b.name))];
  const filteredStudents = students.filter(s => {
    const name = s.name || '';
    const username = s.username || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBatch = filterBatch === 'All' || s.batchName === filterBatch;
    return matchesSearch && matchesBatch;
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '40px', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', maxWidth: '1200px', margin: '0 auto 40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', backgroundColor: '#4F46E5', borderRadius: '12px', color: 'white' }}>
            <Users size={24} />
          </div>
          <h2 style={{ margin: 0, color: '#1E293B', fontWeight: '700' }}>Student Management</h2>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <AnimatePresence>
            {Object.keys(pendingChanges).length > 0 && (
              <motion.button 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                onClick={handleBulkUpdate}
                style={{ backgroundColor: '#10B981', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}
              >
                Update {Object.keys(pendingChanges).length} Changes
              </motion.button>
            )}
          </AnimatePresence>
          <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: '1px solid #E2E8F0', backgroundColor: 'white', cursor: 'pointer', color: '#64748B', fontWeight: '600' }}>
              <ArrowLeft size={18} /> Back
            </button>
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '12px 12px 12px 42px', borderRadius: '14px', border: '1px solid #E2E8F0', outline: 'none' }} />
          </div>
          <select value={filterBatch} onChange={e => setFilterBatch(e.target.value)} style={{ padding: '12px 20px', borderRadius: '14px', border: '1px solid #E2E8F0', backgroundColor: 'white' }}>
            {batches.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <AnimatePresence>
          {selectedUsers.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ padding: '20px', backgroundColor: '#1E293B', borderRadius: '16px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontWeight: 600 }}>{selectedUsers.length} selected</span>
                <select value={bulkTargetBatch} onChange={e => setBulkTargetBatch(e.target.value)} style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#334155', color: 'white', border: 'none' }}>
                  <option value="">Bulk Move...</option>
                  {availableBatches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
                <button onClick={handleBulkMove} style={{ backgroundColor: '#4F46E5', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Move</button>
              </div>
              <button onClick={handleBulkDelete} style={{ backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Delete</button>
            </motion.div>
          )}
        </AnimatePresence>

        <div style={{ backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                <th style={{ padding: '18px 24px', width: '40px' }}>
                  <input type="checkbox" checked={selectedUsers.length === filteredStudents.length && filteredStudents.length > 0} onChange={(e) => setSelectedUsers(e.target.checked ? filteredStudents.map(s => s._id) : [])} style={{ cursor: 'pointer' }} />
                </th>
                <th style={{ padding: '18px 24px', textAlign: 'left', color: '#64748B', fontSize: '14px' }}>STUDENT</th>
                <th style={{ padding: '18px 24px', textAlign: 'left', color: '#64748B', fontSize: '14px' }}>BATCH (EDITABLE)</th>
                <th style={{ padding: '18px 24px', textAlign: 'left', color: '#64748B', fontSize: '14px' }}>STATUS</th>
                <th style={{ padding: '18px 24px', textAlign: 'right', color: '#64748B', fontSize: '14px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center' }}>Loading...</td></tr>
              ) : (
                <AnimatePresence mode='popLayout'>
                  {filteredStudents.map((student) => (
                    <motion.tr key={student._id} layout style={{ borderBottom: '1px solid #F1F5F9', backgroundColor: selectedUsers.includes(student._id) ? '#F8FAFC' : 'transparent' }}>
                      <td style={{ padding: '20px 24px' }}>
                        <input type="checkbox" checked={selectedUsers.includes(student._id)} onChange={() => toggleSelect(student._id)} style={{ cursor: 'pointer' }} />
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <div style={{ fontWeight: '600', color: '#1E293B' }}>{student.name}</div>
                        <div style={{ fontSize: '12px', color: '#94A3B8' }}>@{student.username}</div>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <select 
                          value={pendingChanges[student._id] !== undefined ? pendingChanges[student._id] : (student.batch_id || '')} 
                          onChange={(e) => handleBatchChange(student._id, e.target.value)}
                          style={{ padding: '8px 12px', borderRadius: '10px', border: pendingChanges[student._id] ? '2px solid #10B981' : '1px solid #E2E8F0', backgroundColor: pendingChanges[student._id] ? '#F0FDF4' : 'white', cursor: 'pointer', outline: 'none', fontWeight: '600' }}
                        >
                          <option value="">No Batch</option>
                          {availableBatches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '20px 24px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', backgroundColor: student.status === 'active' ? '#ECFDF5' : '#EFF6FF', color: student.status === 'active' ? '#059669' : '#3B82F6' }}>
                          {student.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          {student.status === 'pending' && <button onClick={() => handleApprove(student._id)} style={{ backgroundColor: '#4F46E5', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>Approve</button>}
                          <button onClick={() => handleDelete(student._id)} style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
          {!loading && filteredStudents.length === 0 && (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94A3B8' }}>No students found.</div>
          )}
        </div>
      </main>
    </div>
  );
}
