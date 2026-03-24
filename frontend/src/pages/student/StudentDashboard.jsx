import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StudentDashboard = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ results: [], attendanceDays: 0 });

  useEffect(() => {
    fetch('http://localhost:3000/api/student/progress', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      // Format chart data
      const results = data.results.map(r => ({
        subject: r.subject,
        percentage: (r.score / r.max_marks) * 100,
        score: r.score,
        max: r.max_marks,
        date: r.date
      }));
      setData({ results, attendanceDays: data.attendanceDays });
    })
    .catch(console.error);
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div>
      <nav className="navbar">
        <div className="navbar-brand">Pace Student</div>
        <div className="flex items-center gap-4">
          <span>Hello, {user?.name}</span>
          <button onClick={handleLogout} style={{ backgroundColor: 'var(--text-dark)' }}>Logout</button>
        </div>
      </nav>

      <div className="content">
        <h2>My Progress Dashboard</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="card">
            <h3>Attendance Tracker</h3>
            <p style={{ fontSize: '2rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
              {data.attendanceDays} Days
            </p>
            <p style={{ color: 'var(--primary-hover)' }}>Total marked presence</p>
          </div>
        </div>

        <div className="card">
          <h3>Academic Growth</h3>
          {data.results.length > 0 ? (
            <div style={{ height: '300px', marginTop: '1.5rem' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.results}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#CFD8DC" />
                  <XAxis dataKey="subject" stroke="#607D8B" />
                  <YAxis stroke="#607D8B" domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="percentage" stroke="#607D8B" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-2 text-center" style={{ color: 'var(--accent-color)' }}>No exam marks available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
