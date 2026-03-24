import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const QRGenerator = () => {
  const { token } = useAuth();
  const [qrCodeId, setQrCodeId] = useState('');

  const fetchQR = () => {
    fetch('http://localhost:3000/api/admin/qr', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setQrCodeId(data.qrCodeId))
    .catch(console.error);
  };

  useEffect(() => {
    fetchQR();
  }, [token]);

  const handleRotate = () => {
    fetch('http://localhost:3000/api/admin/rotate-qr', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => setQrCodeId(data.qrCodeId))
    .catch(console.error);
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
        <div className="card text-center" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2>Daily Gateway QR Code</h2>
          <p className="mb-3">Students must scan this code to login and mark attendance.</p>
          
          {qrCodeId ? (
            <div style={{ padding: '2rem', background: 'white', display: 'inline-block', borderRadius: 'var(--radius-md)' }} className="mb-3">
              <QRCodeSVG value={qrCodeId} size={256} />
            </div>
          ) : (
            <p>Loading QR Code...</p>
          )}
          
          <div>
            <button onClick={handleRotate} style={{ backgroundColor: 'var(--text-dark)' }}>Generate New QR</button>
            <p className="mt-2" style={{ fontSize: '0.9rem', color: 'var(--primary-hover)' }}>Note: Rotating the QR invalidates the previous one.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;
