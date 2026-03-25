import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, ClipboardList, QrCode, UserCheck, LogOut } from 'lucide-react';
import axios from 'axios';

const AdminDashboard = () => {
  const { user, token, logout } = useAuth();
  const [stats, setStats] = useState({ students: 0, batches: 0, exams: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://${window.location.hostname}:5000/api/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => setStats(res.data))
    .catch(console.error);
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div whileHover={{ y: -5 }} className="card text-center">
      <div style={{ color, marginBottom: '0.5rem' }}><Icon size={24} /></div>
      <h2 style={{ margin: 0 }}>{value}</h2>
      <p className="text-muted">{title}</p>
    </motion.div>
  );

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">Pace Admin</div>
        <div className="flex items-center gap-4">
          <span className="text-muted">Welcome, {user?.name}</span>
          <button className="secondary" onClick={handleLogout}><LogOut size={18} /> Logout</button>
        </div>
      </nav>

      <div className="content">
        <div className="flex items-center gap-2 mb-4">
          <LayoutDashboard size={28} color="var(--primary)" />
          <h1>Admin Overview</h1>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <Link to="/admin/students" style={{ textDecoration: 'none', display: 'block' }}>
            <StatCard title="Total Students" value={stats.students} icon={Users} color="#6366F1" />
          </Link>
          <Link to="/admin/batches" style={{ textDecoration: 'none', display: 'block' }}>
            <StatCard title="Active Batches" value={stats.batches} icon={ClipboardList} color="#10B981" />
          </Link>
          <StatCard title="Exams Conducted" value={stats.exams} icon={ClipboardList} color="#F59E0B" />
        </div>

        <div className="card">
          <h3>Management Console</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
            <Link to="/admin/qr-generator" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%' }}><QrCode size={18} /> Multi-Session QR</button>
            </Link>
            <Link to="/admin/approval" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', backgroundColor: 'var(--success)' }}><UserCheck size={18} /> Registration Requests</button>
            </Link>
            <Link to="/admin/batches" style={{ textDecoration: 'none' }}>
              <button className="secondary" style={{ width: '100%' }}><Users size={18} /> Manage Batches</button>
            </Link>
            <Link to="/admin/exams" style={{ textDecoration: 'none' }}>
              <button className="secondary" style={{ width: '100%' }}><ClipboardList size={18} /> Manage Exams</button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
