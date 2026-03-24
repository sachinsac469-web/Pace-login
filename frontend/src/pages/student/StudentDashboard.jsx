import React from 'react';
import { motion } from 'framer-motion';
import { LogOut, BookOpen, Clock, TrendingUp, Award, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';

const mockAttendanceData = [
  { month: 'Oct', attendance: 85 },
  { month: 'Nov', attendance: 90 },
  { month: 'Dec', attendance: 88 },
  { month: 'Jan', attendance: 95 },
  { month: 'Feb', attendance: 92 },
  { month: 'Mar', attendance: 100 },
];

const mockExamData = [
  { subject: 'Math', score: 88, max: 100 },
  { subject: 'Physics', score: 75, max: 100 },
  { subject: 'Chemistry', score: 92, max: 100 },
  { subject: 'Biology', score: 85, max: 100 },
];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth() || { user: { name: 'Student' }, logout: () => navigate('/student/login') };
  const studentName = user?.name || "Student";

  const StatCard = ({ title, value, subtitle, icon: Icon, color }) => (
    <motion.div 
      whileHover={{ y: -4 }}
      className="stat-card"
      style={{
        backgroundColor: '#FFFFFF',
        padding: '24px',
        borderRadius: '20px',
        border: '1px solid #E2E8F0',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)'
      }}
    >
      <div>
        <p style={{ color: '#64748B', fontSize: '15px', fontWeight: '600', margin: '0 0 8px' }}>{title}</p>
        <h3 style={{ color: '#1E293B', fontSize: '32px', fontWeight: 'bold', margin: '0 0 4px' }}>{value}</h3>
        <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>{subtitle}</p>
      </div>
      <div style={{ backgroundColor: `${color}15`, padding: '16px', borderRadius: '16px', color: color }}>
        <Icon size={28} />
      </div>
    </motion.div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Thumb-friendly Mobile CSS Injections */}
      <style>{`
        .dashboard-header {
          padding: 16px 40px;
        }
        .dashboard-main {
          padding: 40px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }
        .chart-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 24px;
        }
        
        @media (max-width: 768px) {
          .dashboard-header {
            padding: 16px 20px !important;
          }
          .dashboard-main {
            padding: 20px !important;
          }
          .stat-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .chart-grid {
            grid-template-columns: 1fr !important;
          }
          .welcome-section {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          /* Hide name on very small screens to save header space */
          .user-info-text {
            display: none !important;
          }
          .logout-btn {
            padding: 12px 16px !important; /* Larger touch target */
          }
        }
      `}</style>

      {/* Top Navigation */}
      <header className="dashboard-header" style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '20px' }}>
            P
          </div>
          <h1 style={{ color: '#1E293B', fontSize: '22px', fontWeight: 'bold', margin: 0 }}>Pace</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="user-info-text" style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontWeight: '600', color: '#1E293B', fontSize: '15px' }}>{studentName}</p>
            <p style={{ margin: 0, color: '#64748B', fontSize: '13px' }}>Student Portal</p>
          </div>
          <button
            className="logout-btn"
            onClick={() => {
              if (logout) logout();
              navigate('/student/login');
            }}
            style={{
              padding: '10px 16px',
              backgroundColor: '#FEF2F2',
              color: '#EF4444',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600',
              fontSize: '15px',
              transition: 'background-color 0.2s'
            }}
          >
            <LogOut size={20} />
            <span className="user-info-text">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        
        <div className="welcome-section" style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 style={{ fontSize: '30px', fontWeight: 'bold', color: '#1E293B', margin: '0 0 8px' }}>Welcome back, {studentName.split(' ')[0]}! 👋</h2>
            <p style={{ color: '#64748B', fontSize: '18px', margin: 0 }}>Here is your academic progress report.</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '16px 24px', backgroundColor: '#ECFDF5', color: '#059669', borderRadius: '16px', border: '1px solid #A7F3D0', flexShrink: 0 }}>
            <CheckCircle size={22} />
            <span style={{ fontWeight: '600', fontSize: '15px' }}>Attendance verified</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="stat-grid">
          <StatCard title="Overall Attendance" value="92%" subtitle="Target: 75% minimum" icon={Clock} color="#4F46E5" />
          <StatCard title="Average Score" value="85%" subtitle="Across 4 recent exams" icon={TrendingUp} color="#10B981" />
          <StatCard title="Classes Attended" value="142" subtitle="Out of 154 total classes" icon={BookOpen} color="#F59E0B" />
          <StatCard title="Global Rank" value="#12" subtitle="Top 5% of your batch" icon={Award} color="#8B5CF6" />
        </div>

        {/* Charts Grid */}
        <div className="chart-grid">
          
          {/* Attendance Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0' }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1E293B', margin: '0 0 24px' }}>Attendance History</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 14, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 14, fontWeight: 500 }} dx={-10} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="attendance" stroke="#4F46E5" strokeWidth={4} dot={{ r: 5, strokeWidth: 2 }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Exam Performance Chart */}
          <motion.div 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             style={{ backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '20px', border: '1px solid #E2E8F0' }}
          >
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1E293B', margin: '0 0 24px' }}>Recent Exam Scores</h3>
            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockExamData} barSize={40} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 14, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 14, fontWeight: 500 }} dx={-10} domain={[0, 100]} />
                  <Tooltip 
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="score" fill="#10B981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>
      </main>
    </div>
  );
}
