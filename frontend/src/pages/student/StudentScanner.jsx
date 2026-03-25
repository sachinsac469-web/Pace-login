import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Camera, ArrowLeft, Loader2, QrCode } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StudentScanner() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [error, setError] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let scanner = null;
    if (isScanning) {
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 20, 
          qrbox: { width: 250, height: 250 }, 
          videoConstraints: { facingMode: "environment" },
          showTorchButtonIfSupported: true
        },
        false
      );
      scanner.render((decodedText) => {
        scanner.clear();
        setIsScanning(false);
        handleScan(decodedText);
      }, (err) => {
        // Silencing NotFoundException to prevent console clutter
        if (!err?.toLowerCase().includes("not found")) {
          // console.error(err);
        }
      });
    }
    return () => { if (scanner) scanner.clear().catch(e => {}); };
  }, [isScanning]);

  const handleScan = async (signedQR) => {
    try {
      setError('');
      const res = await axios.post(`http://${window.location.hostname}:5000/api/attendance/verify`, 
        { signedQR },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccessData(res.data);
      setTimeout(() => navigate('/student/dashboard'), 4000);
    } catch (err) {
      if (err.response?.status === 401 && err.response?.data?.error?.includes('another device')) {
        logout(err.response.data.error);
        navigate('/student/login');
      } else {
        setError(err.response?.data?.error || "Attendance failed");
      }
    }
  };

  return (
    <div className="app-container">
      <AnimatePresence>
        {successData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ 
              position: 'fixed', inset: 0, zIndex: 1000, 
              backgroundColor: '#F0FDF4', display: 'flex', flexDirection: 'column', 
              alignItems: 'center', justifyContent: 'center', textAlign: 'center' 
            }}
          >
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} style={{ color: 'var(--success)' }}>
              <CheckCircle size={100} />
            </motion.div>
            <h1 style={{ color: '#166534', marginTop: '1.5rem' }}>Attendance Confirmed!</h1>
            
            <div style={{ marginTop: '1.5rem', color: '#166534' }}>
              <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>Subject: {successData.subjectName}</p>
              <p style={{ fontSize: '1rem', opacity: 0.8 }}>Date: {successData.date}</p>
              <p style={{ fontSize: '1rem', opacity: 0.8 }}>Time: {successData.timeRange}</p>
            </div>
            
            <p style={{ color: 'var(--success)', fontWeight: 600, marginTop: '2rem' }}>You have been marked Present.</p>
            <p className="text-muted" style={{ marginTop: '2rem', fontSize: '0.9rem' }}>Redirecting to dashboard...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="navbar">
        <div className="navbar-brand">Pace Student</div>
        <Link to="/student/dashboard">
          <button className="secondary"><ArrowLeft size={18} /> Dashboard</button>
        </Link>
      </nav>

      <div className="content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <AnimatePresence mode="wait">
          {!successData && (
            <motion.div 
              key="scanner-ui"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card"
              style={{ maxWidth: '400px', width: '100%' }}
            >
              <div style={{ marginBottom: '2rem' }}>
                <div style={{ backgroundColor: 'var(--bg-color)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: 'var(--primary)' }}>
                  <QrCode size={32} />
                </div>
                <h3>Scan Class QR</h3>
                <p className="text-muted">Point your camera at the teacher's screen QR.</p>
              </div>

              {error && <div className="alert">{error}</div>}

              {!isScanning ? (
                <button 
                  style={{ width: '100%' }} 
                  onClick={() => setIsScanning(true)}
                >
                  <Camera size={20} /> Open Scanner
                </button>
              ) : (
                <div>
                  <div id="qr-reader"></div>
                  <button className="secondary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setIsScanning(false)}>Cancel</button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
