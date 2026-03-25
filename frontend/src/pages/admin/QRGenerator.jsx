import React, { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { motion } from 'framer-motion';
import { QrCode, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

export default function QRGenerator() {
  const { token } = useAuth();
  const [batches, setBatches] = useState([]);
  const [qrValue, setQrValue] = useState('');
  const [formData, setFormData] = useState({
    batch_id: '',
    batchName: '',
    subjectName: ''
  });

  useEffect(() => {
    axios.get(`http://${window.location.hostname}:5000/api/admin/batches`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setBatches(res.data))
    .catch(console.error);
  }, [token]);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!formData.subjectName || !formData.batch_id) return;
    
    // Requirement: Combine subjectName, batchName, and new Date().toISOString()
    const value = `${formData.subjectName}_${formData.batchName}_${new Date().toISOString()}`;
    setQrValue(value);
  };

  const currentBatch = batches.find(b => b._id === formData.batch_id || b.batch_id === formData.batch_id);
  const subjectsForBatch = currentBatch?.subjects || ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC', padding: '40px', fontFamily: 'Inter, sans-serif' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '10px', backgroundColor: '#4F46E5', borderRadius: '12px', color: 'white' }}>
            <QrCode size={24} />
          </div>
          <h2 style={{ margin: 0, color: '#1E293B' }}>QR Generator</h2>
        </div>
        <Link to="/admin/dashboard" style={{ textDecoration: 'none' }}>
          <button style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '10px 20px', 
            borderRadius: '12px', 
            border: '1px solid #E2E8F0', 
            backgroundColor: 'white', 
            cursor: 'pointer',
            color: '#64748B',
            fontWeight: '600'
          }}>
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
        </Link>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 450px) 1fr', gap: '40px', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Form Column */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ backgroundColor: 'white', padding: '32px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <h3 style={{ marginBottom: '24px' }}>Session Details</h3>
          <form onSubmit={handleGenerate}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#64748B', fontWeight: '500' }}>Select Batch</label>
              <select 
                value={formData.batch_id} 
                onChange={e => {
                  const b = batches.find(x => x._id === e.target.value || x.batch_id === e.target.value);
                  setFormData({...formData, batch_id: e.target.value, batchName: b?.name || '', subjectName: ''});
                }} 
                required
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #F1F5F9', outline: 'none', fontSize: '16px' }}
              >
                <option value="">-- Choose Batch --</option>
                {batches.map(b => <option key={b._id || b.batch_id} value={b._id || b.batch_id}>{b.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#64748B', fontWeight: '500' }}>Select Subject</label>
              <select 
                value={formData.subjectName} 
                onChange={e => setFormData({...formData, subjectName: e.target.value})} 
                required
                disabled={!formData.batch_id}
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '2px solid #F1F5F9', outline: 'none', fontSize: '16px', backgroundColor: !formData.batch_id ? '#F8FAFC' : 'white' }}
              >
                <option value="">-- Choose Subject --</option>
                {subjectsForBatch.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <button type="submit" style={{ 
              width: '100%', 
              backgroundColor: '#4F46E5', 
              color: 'white', 
              padding: '16px', 
              borderRadius: '14px', 
              border: 'none', 
              fontWeight: '700', 
              fontSize: '16px',
              cursor: 'pointer',
              boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)'
            }}>
              Generate QR Code
            </button>
          </form>
        </motion.div>

        {/* QR Display Column */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ 
          backgroundColor: 'white', 
          padding: '40px', 
          borderRadius: '24px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {qrValue ? (
            <div style={{ textAlign: 'center' }}>
              <motion.div 
                key={qrValue}
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }}
                style={{ padding: '24px', backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', display: 'inline-block' }}
              >
                <QRCodeCanvas value={qrValue} size={256} />
              </motion.div>
              <div style={{ marginTop: '32px' }}>
                <span style={{ padding: '6px 14px', backgroundColor: '#EEEDFD', color: '#4F46E5', borderRadius: '10px', fontSize: '14px', fontWeight: '600' }}>
                  {formData.batchName} • {formData.subjectName}
                </span>
                <p style={{ marginTop: '16px', color: '#94A3B8', fontSize: '13px', maxWidth: '300px' }}>
                  Students should scan this code within the next 5-10 minutes to mark their attendance.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ width: '80px', height: '80px', backgroundColor: '#F1F5F9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: '#94A3B8' }}>
                <QrCode size={40} />
              </div>
              <p style={{ color: '#64748B', maxWidth: '240px', lineHeight: '1.6' }}>Please select a batch and subject to generate the attendance QR</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
