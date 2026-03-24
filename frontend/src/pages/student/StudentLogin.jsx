import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { QrReader } from 'react-qr-reader';

const StudentLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleScan = async (result, error) => {
    if (result) {
      setScanning(false);
      const qrCodeId = result?.text;
      try {
        const res = await fetch('http://localhost:3000/api/student/qr-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password, qrCodeId })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        
        login(data.token, { role: data.role, name: data.name });
        navigate('/student/dashboard');
      } catch (err) {
        setError(err.message);
      }
    }
    if (error && error.name !== 'NotFoundException') {
      console.warn(error);
    }
  };

  const startScan = (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter username and password before scanning.');
      return;
    }
    setError('');
    setScanning(true);
  };

  return (
    <div className="content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
        <h2 className="text-center">Student Login</h2>
        <p className="text-center mb-3" style={{ fontSize: '0.9rem', color: 'var(--primary-hover)' }}>
          Enter credentials, then scan the daily Gateway QR Code.
        </p>
        
        {error && <div className="alert">{error}</div>}

        {!scanning ? (
          <form onSubmit={startScan}>
            <div className="mb-2">
              <label>Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" style={{ width: '100%' }}>Scan QR to Login</button>
          </form>
        ) : (
          <div>
            <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', marginBottom: '1rem' }}>
              <QrReader
                onResult={handleScan}
                constraints={{ facingMode: 'environment' }}
                style={{ width: '100%' }}
              />
            </div>
            <button onClick={() => setScanning(false)} style={{ width: '100%', backgroundColor: 'var(--accent-color)', color: 'var(--text-dark)' }}>
              Cancel Scan
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLogin;
