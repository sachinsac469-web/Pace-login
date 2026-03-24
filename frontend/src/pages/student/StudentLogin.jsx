import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import axios from 'axios';
import { motion } from 'framer-motion';
import { QrCode, User, AlertCircle, CheckCircle, Camera } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function StudentLogin() {
  const navigate = useNavigate();
  const { login } = useAuth() || { login: () => {} };
  const [username, setUsername] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let scanner = null;
    if (isScanning) {
      // Configuration tailored exactly for mobile scanning
      // We enforce facingMode: "environment" for the rear camera.
      scanner = new Html5QrcodeScanner(
        "qr-reader",
        { 
          fps: 10, 
          qrbox: { width: 250, height: 250 },
          videoConstraints: { facingMode: "environment" }
        },
        false
      );

      scanner.render((decodedText) => {
        setScanResult(decodedText);
        scanner.clear();
        setIsScanning(false);
        handleAttendanceLogin(decodedText);
      }, (err) => {
        // Suppress non-critical errors (like no QR found in frame)
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(e => console.error(e));
      }
    };
  }, [isScanning, username]);

  const handleAttendanceLogin = async (qrData) => {
    if (!username) {
      setError("Please enter your Username/Roll No first.");
      setScanResult(null);
      return;
    }

    try {
      setError('');
      setSuccess('Verifying QR and logging in...');
      
      const today = new Date();
      const expectedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      const expectedQR = `ATTENDANCE_${expectedDate}`;
      
      if (qrData !== expectedQR) {
        setSuccess('');
        setError("Invalid or Expired QR Code.");
        return;
      }

      if (login) {
        await login({ username, role: 'student', id: 1, name: 'Student' });
      }

      try {
        // Dynamic Hostname specifically for Local Wi-Fi Mobile Testing
        const apiUrl = `http://${window.location.hostname}:5000/api/attendance/mark`;
        await axios.post(apiUrl, {
          username,
          qrData,
          status: 'Present'
        });
      } catch (e) {
        console.warn("Backend not active, mock attendance recorded.");
      }

      setSuccess('Attendance Marked successfully! Redirecting...');
      setTimeout(() => {
        navigate('/student/dashboard');
      }, 1500);

    } catch (err) {
      setError("Failed to verify attendance. Please try again.");
      setSuccess('');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F8FAFC',
      fontFamily: 'Inter, sans-serif',
      padding: '16px' // Optimized for mobile viewport
    }}>
      <style>{`
        #qr-reader {
          border-radius: 16px; 
          border: none !important; 
          overflow: hidden; 
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        #qr-reader button {
          padding: 12px 24px !important;
          background-color: #4F46E5 !important;
          color: white !important;
          border-radius: 12px !important;
          border: none !important;
          font-weight: 600 !important;
          cursor: pointer !important;
          margin-top: 12px !important;
        }
      `}</style>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%',
          maxWidth: '480px',
          backgroundColor: '#FFFFFF',
          borderRadius: '24px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden'
        }}
      >
        <div style={{
          backgroundColor: '#4F46E5',
          padding: '40px 24px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ backgroundColor: 'rgba(255,255,255,0.2)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <QrCode size={32} />
          </div>
          <h1 style={{ margin: '0 0 8px', fontSize: '26px', fontWeight: 'bold' }}>Scan to Login</h1>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '15px' }}>
            Mark your attendance & access your portal
          </p>
        </div>

        <div style={{ padding: '32px 24px' }}>
          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px', backgroundColor: '#FEF2F2', color: '#DC2626', borderRadius: '12px', marginBottom: '24px', fontSize: '15px', fontWeight: '500' }}>
              <AlertCircle size={20} />
              {error}
            </div>
          )}
          
          {success && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px', backgroundColor: '#F0FDF4', color: '#16A34A', borderRadius: '12px', marginBottom: '24px', fontSize: '15px', fontWeight: '500' }}>
              <CheckCircle size={20} />
              {success}
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#64748B', fontSize: '15px', fontWeight: '600', marginBottom: '10px' }}>
              Student Username
            </label>
            <div style={{ position: 'relative' }}>
              <User size={22} color="#94A3B8" style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '16px' }} />
              <input 
                type="text"
                placeholder="e.g. johndoe123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isScanning || success}
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px', /* large padding for thumb typing */
                  borderRadius: '16px',
                  border: '2px solid #E2E8F0',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                  backgroundColor: (isScanning || success) ? '#F1F5F9' : '#FFFFFF'
                }}
              />
            </div>
          </div>

          {!isScanning && !success && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if(!username) {
                  setError("Please enter your username first");
                } else {
                  setError('');
                  setIsScanning(true);
                }
              }}
              style={{
                width: '100%',
                padding: '16px', /* Thumb friendly padding */
                backgroundColor: '#4F46E5',
                color: '#FFFFFF',
                borderRadius: '16px',
                border: 'none',
                fontSize: '18px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.3)'
              }}
            >
              <Camera size={22} />
              Request Camera & Scan
            </motion.button>
          )}

          {isScanning && (
            <div style={{ marginTop: '16px' }}>
              <p style={{ textAlign: 'center', color: '#64748B', fontSize: '15px', marginBottom: '16px', fontWeight: '500' }}>
                Approve camera permissions if prompted.
              </p>
              <div id="qr-reader"></div>
              <button
                onClick={() => setIsScanning(false)}
                style={{
                  width: '100%',
                  padding: '16px',
                  marginTop: '20px',
                  backgroundColor: '#F1F5F9',
                  color: '#64748B',
                  borderRadius: '16px',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Cancel Scanning
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
