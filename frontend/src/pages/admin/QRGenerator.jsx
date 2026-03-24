import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, UserCheck, LogOut, QrCode } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { path: '/admin/batches', icon: <Users size={20} />, label: 'Batches' },
    { path: '/admin/exams', icon: <UserCheck size={20} />, label: 'Exams' },
    { path: '/admin/qr-generator', icon: <QrCode size={20} />, label: 'Generate QR' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        style={{ width: '250px', backgroundColor: '#FFFFFF', borderRight: '1px solid #E2E8F0', padding: '24px 16px', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ marginBottom: '40px', padding: '0 12px' }}>
          <h1 style={{ color: '#4F46E5', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Pace Admin</h1>
          <p style={{ color: '#64748B', fontSize: '14px', margin: '4px 0 0 0' }}>Management Portal</p>
        </div>
        
        <nav style={{ flex: 1 }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path} style={{ marginBottom: '8px' }}>
                  <button
                    onClick={() => navigate(item.path)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: isActive ? '#EEEDFD' : 'transparent',
                      color: isActive ? '#4F46E5' : '#64748B',
                      cursor: 'pointer',
                      fontWeight: isActive ? '600' : '500',
                      transition: 'all 0.2s ease',
                      textAlign: 'left'
                    }}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          onClick={() => navigate('/')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: 'transparent',
            color: '#EF4444',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.2s ease',
            textAlign: 'left'
          }}
        >
          <LogOut size={20} />
          Logout
        </button>
      </motion.aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  );
};

export default function QRGenerator() {
  const [qrData, setQrData] = useState('');
  const [currentDateString, setCurrentDateString] = useState('');

  useEffect(() => {
    // Generate QR Data string with current date (e.g. ATTENDANCE_2026-03-24)
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${yyyy}-${mm}-${dd}`;
    
    setCurrentDateString(formattedDate);
    setQrData(`ATTENDANCE_${formattedDate}`);
  }, []);

  return (
    <AdminLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ maxWidth: '800px', margin: '0 auto' }}
      >
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ color: '#1E293B', fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Daily Attendance QR</h2>
          <p style={{ color: '#64748B', fontSize: '16px', margin: 0 }}>
            Students must scan this code today to mark their attendance.
          </p>
        </div>

        <div style={{ 
          backgroundColor: '#FFFFFF', 
          borderRadius: '16px', 
          padding: '48px', 
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {qrData ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                padding: '24px',
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '2px solid #E2E8F0'
              }}
            >
              <QRCodeSVG 
                value={qrData} 
                size={256} 
                level="Q"
                includeMargin={false}
                fgColor="#1E293B"
              />
            </motion.div>
          ) : (
            <div style={{ height: '256px', display: 'flex', alignItems: 'center' }}>Loading...</div>
          )}

          <div style={{ marginTop: '32px', textAlign: 'center' }}>
            <p style={{ color: '#64748B', fontSize: '14px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '600' }}>
              Valid for Date
            </p>
            <p style={{ color: '#4F46E5', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
              {currentDateString}
            </p>
          </div>
          
          <p style={{ marginTop: '32px', color: '#94A3B8', fontSize: '14px', maxWidth: '400px', textAlign: 'center' }}>
            To prevent fraudulent attendance using screenshots, this QR code is strictly bound to today's date. Keep this screen visible for students entering the class.
          </p>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
