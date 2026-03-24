import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const AdminBatches = () => {
  const { token } = useAuth();
  const [batches, setBatches] = useState([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');

  const fetchBatches = () => {
    fetch('http://localhost:3000/api/admin/batches', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setBatches(data))
    .catch(console.error);
  };

  useEffect(() => {
    fetchBatches();
  }, [token]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/admin/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name, description })
      });
      if (!res.ok) throw new Error('Failed to create batch');
      setMessage('Batch created successfully');
      setName('');
      setDescription('');
      fetchBatches();
    } catch (err) {
      setMessage(err.message);
    }
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
        <h2>Manage Batches</h2>
        <div className="card">
          <h3>Create New Batch</h3>
          {message && <div className="alert">{message}</div>}
          <form onSubmit={handleCreate}>
            <div className="mb-2">
              <label>Batch Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label>Description</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} />
            </div>
            <button type="submit">Create Batch</button>
          </form>
        </div>

        <div className="card">
          <h3>Existing Batches</h3>
          {batches.length === 0 ? <p>No batches found.</p> : (
            <ul style={{ listStyleType: 'none' }}>
              {batches.map(b => (
                <li key={b.batch_id} style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                  <strong>{b.name}</strong> - {b.description}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBatches;
