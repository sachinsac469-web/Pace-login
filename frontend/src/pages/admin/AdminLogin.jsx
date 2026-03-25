import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, LogIn, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [forgotUser, setForgotUser] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveredPassword, setRecoveredPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError('');
      const res = await axios.post(`http://${window.location.hostname}:5000/api/login`, { username, password });
      if (res.data.role !== 'admin') throw new Error('Not an admin account');
      
      login(res.data.token, { role: res.data.role, name: res.data.name, session_uuid: res.data.session_uuid });
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Login failed");
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    try {
      setError(''); setRecoveredPassword('');
      const res = await axios.get(`http://${window.location.hostname}:5000/api/users/forgot-password/${forgotUser}`);
      setRecoveredPassword(res.data.password);
    } catch (err) {
      setError(err.response?.data?.error || "User not found");
    }
  };

  return (
    <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <div style={{ position: 'absolute', top: '1.5rem', left: '1.5rem' }}>
          <Link to="/" style={{ color: 'var(--text-muted)' }}>
            <ArrowLeft size={20} />
          </Link>
        </div>

        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'var(--bg-color)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
            <Lock size={32} />
          </div>
          <h2>Pace Admin</h2>
          <p className="text-muted">Master Portal Login</p>
        </div>

        {error && <div className="alert">{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Username</label>
            <input type="text" placeholder="admin_user" value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="mb-6">
            <label className="text-muted" style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', padding: 0 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} /> }
              </button>
            </div>
          </div>
          <button type="submit" style={{ width: '100%' }}><LogIn size={18} /> Enter Dashboard</button>
          
          <div className="text-center mt-2">
            <button type="button" onClick={() => setShowForgotModal(true)} style={{ fontSize: '0.85rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
              Forgot Password?
            </button>
          </div>
        </form>

        {showForgotModal && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ maxWidth: '350px', width: '90%' }}>
              <h3>Recovery</h3>
              <p className="text-muted mb-4">Master credential recovery.</p>
              <form onSubmit={handleForgotPassword}>
                <input type="text" placeholder="Username" value={forgotUser} onChange={e => setForgotUser(e.target.value)} required autoFocus />
                
                {recoveredPassword && (
                  <div style={{ backgroundColor: '#EEF2FF', color: '#4F46E5', padding: '12px', borderRadius: '12px', marginBottom: '16px', fontSize: '14px', border: '1px solid #C7D2FE' }}>
                    Your password is: <strong>{recoveredPassword}</strong>
                  </div>
                )}

                {error && <div className="alert">{error}</div>}

                <div className="flex gap-2">
                  {!recoveredPassword && <button type="submit" style={{ flex: 1 }}>Show Password</button>}
                  <button type="button" className="secondary" onClick={() => { setShowForgotModal(false); setRecoveredPassword(''); setForgotUser(''); }} style={{ flex: 1 }}>
                    {recoveredPassword ? 'Done' : 'Cancel'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminLogin;
