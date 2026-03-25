import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Plus, ArrowLeft, Info, Loader2, Trash2, Edit3, X } from 'lucide-react';
import axios from 'axios';

const AdminBatches = () => {
  const { token } = useAuth();
  const [batches, setBatches] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [subjects, setSubjects] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Edit State
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSubs, setEditSubs] = useState('');

  const fetchBatches = () => {
    axios.get(`http://${window.location.hostname}:5000/api/admin/batches`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setBatches(res.data))
      .catch(console.error);
  };

  useEffect(() => {
    fetchBatches();
  }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        `http://${window.location.hostname}:5000/api/admin/batches`,
        {
          name,
          description,
          subjects: subjects.split(',').map(s => s.trim()).filter(Boolean)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessage('Batch created successfully');
      setName('');
      setDescription('');
      setSubjects('');
      fetchBatches();

      setTimeout(() => setMessage(''), 3000);

    } catch (err) {
      setMessage(err.response?.data?.error || 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure? This will delete all session and attendance records for this batch.")) return;
    try {
      await axios.delete(`http://${window.location.hostname}:5000/api/admin/batches/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchBatches();
    } catch (err) {
      if (err.response?.status === 409) {
        if (window.confirm(`This batch has ${err.response.data.studentCount} students. Force delete? (This will unassign all students)`)) {
          try {
            await axios.delete(`http://${window.location.hostname}:5000/api/admin/batches/${id}?force=true`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            fetchBatches();
          } catch (forceErr) {
            alert("Force delete failed");
          }
        }
      } else {
        alert(err.response?.data?.error || "Delete failed");
      }
    }
  };

  const startEdit = (b) => {
    setEditingId(b._id);
    setEditName(b.name);
    setEditDesc(b.description || '');
    setEditSubs(b.subjects?.join(', ') || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://${window.location.hostname}:5000/api/admin/batches/${editingId}`, {
        name: editName,
        description: editDesc,
        subjects: editSubs.split(',').map(s => s.trim()).filter(Boolean)
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setEditingId(null);
      fetchBatches();
    } catch (err) {
      alert("Update failed");
    }
  };

  return (<div className="app-container"> <nav className="navbar"> <div className="navbar-brand">Pace Admin</div> <Link to="/admin/dashboard"> <button className="secondary"> <ArrowLeft size={18} /> Dashboard </button> </Link> </nav>

    < div className="content" >
      <div className="flex items-center gap-2 mb-4">
        <Users size={28} color="var(--primary)" />
        <h1>Manage Batches</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

        {/* CREATE */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card">
          <h3><Plus size={18} /> Create New Batch</h3>

          {message && (
            <div className={`alert ${message.includes('success') ? 'success-alert' : ''}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleCreate} style={{ marginTop: '1.5rem' }}>

            <div className="mb-4">
              <label className="text-muted">Batch Name</label>
              <input
                type="text"
                placeholder="e.g. Batch 2024-A"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="text-muted">Description</label>
              <input
                type="text"
                placeholder="Short description"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </div>

            <div className="mb-6">
              <label className="text-muted">Subjects (comma separated)</label>
              <input
                type="text"
                placeholder="e.g. Math, Physics, Chemistry"
                value={subjects}
                onChange={e => setSubjects(e.target.value)}
              />
            </div>

            <button type="submit" style={{ width: '100%' }} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : "Create Batch"}
            </button>
          </form>
        </motion.div>

        {/* LIST */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card">
          <h3><Info size={18} /> Existing Batches</h3>

          <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
            <AnimatePresence>
              {batches.length === 0 ? (
                <p className="text-muted">No batches found.</p>
              ) : (
                batches.map(b => (
                  <motion.div
                    key={b.batch_id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      padding: '1rem',
                      background: 'var(--bg-color)',
                      borderRadius: '12px'
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div style={{ fontWeight: 600 }}>{b.name}</div>

                        <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                          {b.description}
                        </div>

                        {b.subjects?.length > 0 && (
                          <div style={{ marginTop: '5px', fontSize: '0.8rem' }}>
                            📚 {b.subjects.join(', ')}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        {editingId === b._id ? (
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <button onClick={handleUpdate} style={{ padding: '0.4rem', border: 'none', background: '#DCFCE7', color: '#166534', borderRadius: '8px', cursor: 'pointer' }}>
                              <Plus size={16} />
                            </button>
                            <button onClick={() => setEditingId(null)} style={{ padding: '0.4rem', border: 'none', background: '#FEE2E2', color: '#EF4444', borderRadius: '8px', cursor: 'pointer' }}>
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Link to={`/admin/batches/${b._id}`}>
                              <button className="secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                                View
                              </button>
                            </Link>
                            <button 
                              onClick={() => startEdit(b)}
                              style={{ padding: '0.4rem', border: 'none', background: '#EEF2FF', color: 'var(--primary)', borderRadius: '8px', cursor: 'pointer' }}
                            >
                              <Edit3 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(b._id)}
                              style={{ padding: '0.4rem', border: 'none', background: '#FEE2E2', color: '#EF4444', borderRadius: '8px', cursor: 'pointer' }}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {editingId === b._id && (
                      <div style={{ marginTop: '1rem', display: 'grid', gap: '0.5rem' }}>
                        <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Batch Name" style={{ marginBottom: 0, padding: '8px' }} />
                        <input value={editSubs} onChange={e => setEditSubs(e.target.value)} placeholder="Subjects (comma sep)" style={{ marginBottom: 0, padding: '8px' }} />
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </div >
  </div >


  );
};

export default AdminBatches;
