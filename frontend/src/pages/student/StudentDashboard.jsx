import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { LogOut, BookOpen, Clock, TrendingUp, Award, CheckCircle, Camera, Calendar } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import axios from 'axios';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [data, setData] = useState({ results: [], attendanceDays: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://${window.location.hostname}:5000/api/student/progress`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setData(res.data))
    .catch(console.error)
    .finally(() => setLoading(false));
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const subjects = Object.keys(data.batchClasses || {});
  const subjectStats = subjects.map(sub => {
    const attended = data.subjectAttendance?.[sub] || 0;
    const total = data.batchClasses?.[sub] || 0;
    const percent = total > 0 ? Math.min(100, Math.round((attended / total) * 100)) : 0;
    return { sub, attended, total, percent };
  });

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div whileHover={{ y: -5 }} className="card">
      <div style={{ color, marginBottom: '0.5rem' }}><Icon size={24} /></div>
      <h2 style={{ margin: 0 }}>{value}</h2>
      <p className="text-muted">{title}</p>
    </motion.div>
  );

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-brand">Pace Student</div>
        <div className="flex items-center gap-4">
          <span className="text-muted">Welcome, {user?.name}</span>
          <button className="secondary" onClick={handleLogout}><LogOut size={18} /> Logout</button>
        </div>
      </nav>

      <main className="content">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <BookOpen size={28} color="var(--primary)" />
            <h1>Academic Progress</h1>
          </div>
          <Link to="/student/scanner">
            <button><Camera size={18} /> Scan Attendance</button>
          </Link>
        </div>

        {/* Attendance Per Subject */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {subjectStats.map(stat => (
            <div key={stat.sub} className="card" style={{ borderLeft: `4px solid ${stat.percent > 75 ? '#10B981' : '#F59E0B'}` }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748B', marginBottom: '0.5rem' }}>{stat.sub}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1E293B' }}>{stat.percent}%</span>
                <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>{stat.attended}/{stat.total} Classes</span>
              </div>
              <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '10px', marginTop: '12px', overflow: 'hidden' }}>
                <motion.div initial={{ width: 0 }} animate={{ width: `${stat.percent}%` }} style={{ height: '100%', background: stat.percent > 75 ? '#10B981' : '#F59E0B' }} />
              </div>
            </div>
          ))}
          {subjects.length === 0 && (
            <StatCard title="Overall Attendance" value={`${data.attendanceDays} Days`} icon={Clock} color="#6366F1" />
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
          <div className="card">
            <h3>Performance History</h3>
            <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.results}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[0, 100]} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="score" stroke="var(--primary)" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h3>Recent Results</h3>
            <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
              {data.results.length === 0 ? <p className="text-muted">No exam results found.</p> : 
                data.results.slice(-4).reverse().map((r, i) => (
                  <div key={i} className="flex justify-between items-center" style={{ padding: '1rem', background: 'var(--bg-color)', borderRadius: '12px' }}>
                    <div>
                      <p style={{ fontWeight: 600, margin: 0 }}>{r.subject}</p>
                      <p className="text-muted" style={{ fontSize: '0.8rem', margin: 0 }}>{r.date}</p>
                    </div>
                    <div style={{ fontWeight: 800, color: 'var(--primary)' }}>
                      {r.score}/{r.max_marks}
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
