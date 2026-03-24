import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, token, logout } = useAuth();
  const [stats, setStats] = useState({ students: 0, batches: 0, exams: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:3000/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setStats(data))
    .catch(console.error);
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-brand">Pace Admin</div>
        <div className="flex items-center gap-4">
          <span>Welcome, {user?.name}</span>
          <button onClick={handleLogout} style={{ backgroundColor: 'var(--text-dark)' }}>Logout</button>
        </div>
      </nav>

      <div className="content">
        <h2>Dashboard Overview</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card text-center">
            <h3>{stats.students}</h3>
            <p>Total Students</p>
          </div>
          <div className="card text-center">
            <h3>{stats.batches}</h3>
            <p>Active Batches</p>
          </div>
          <div className="card text-center">
            <h3>{stats.exams}</h3>
            <p>Exams Conducted</p>
          </div>
        </div>

        <div className="card">
          <h3>Quick Actions</h3>
          <div className="flex gap-2 mt-2">
            <Link to="/admin/qr-generator">
              <button>Dynamic QR Generator</button>
            </Link>
            <Link to="/admin/batches">
              <button style={{ backgroundColor: 'var(--text-dark)' }}>Manage Batches</button>
            </Link>
            <Link to="/admin/exams">
              <button style={{ backgroundColor: 'var(--text-dark)' }}>Manage Exams</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
