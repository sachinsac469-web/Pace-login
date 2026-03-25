import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { QrCode, LogIn, Eye, EyeOff, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function StudentLogin() {
  const navigate = useNavigate();
  const { login } = useAuth() || { login: () => {} };
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');

  useEffect(() => {
    axios.get(`http://${window.location.hostname}:5000/api/public/batches`)
      .then(res => setBatches(res.data))
      .catch(e => console.error("No common batches found"));
  }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotUser, setForgotUser] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [recoveredPassword, setRecoveredPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setError(''); setSuccess('');
      const res = await axios.post(`http://${window.location.hostname}:5000/api/login`, { username, password });
      if (login) login(res.data.token, { role: res.data.role, name: res.data.name, session_uuid: res.data.session_uuid });
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
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

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      setError(''); setSuccess('');
      const res = await axios.post(`http://${window.location.hostname}:5000/api/register`, {
        username, email, password, name, batchName: selectedBatch
      });
      setSuccess(res.data.message);
      setShowRegister(false);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed.");
    }
  };

  return (
    <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'var(--bg-color)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: 'var(--primary)' }}>
            <QrCode size={32} />
          </div>
          <h2>Pace Login</h2>
          <p className="text-muted">Student Portal</p>
        </div>

        {error && <div className="alert">{error}</div>}
        {success && <div className="alert success-alert">{success}</div>}

        {!showRegister ? (
          <form onSubmit={handleLogin}>
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
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
            <button type="submit" style={{ width: '100%' }}><LogIn size={18} /> Login</button>
            
            <div className="text-center mt-2">
              <button type="button" className="text-button" onClick={() => setShowForgotModal(true)} style={{ fontSize: '0.85rem', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                Forgot Password?
              </button>
            </div>

            <div className="text-center mt-4">
              <span className="text-muted">New student? </span>
              <button type="button" className="secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => setShowRegister(true)}>Request Access</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required />
            <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
            <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} required>
              <option value="">-- Select Your Batch --</option>
              {batches.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
            </select>
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="submit" style={{ width: '100%' }}>Submit Signup Request</button>
            <div className="text-center mt-4">
              <button type="button" className="secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }} onClick={() => setShowRegister(false)}>Back to Login</button>
            </div>
          </form>
        )}
      </motion.div>

      {showForgotModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card" style={{ maxWidth: '350px', width: '90%' }}>
            <h3>Recovery</h3>
            <p className="text-muted mb-4">Enter your username to see your password.</p>
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
    </div>
  );
}
