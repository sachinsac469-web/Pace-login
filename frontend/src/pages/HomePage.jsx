import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GraduationCap, UserCircle, ShieldCheck, ArrowRight } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="card text-center" 
        style={{ maxWidth: '600px', width: '100%', padding: '3rem' }}
      >
        <div style={{ backgroundColor: 'var(--bg-color)', width: '80px', height: '80px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem', color: 'var(--primary)' }}>
          <GraduationCap size={44} />
        </div>
        
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Welcome to Pace</h1>
        <p className="text-muted" style={{ fontSize: '1.2rem', marginBottom: '3rem' }}>
          A secure, multi-session attendance & academic management system designed for excellence.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <Link to="/student/login" style={{ textDecoration: 'none' }}>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.2rem' }}
            >
              <UserCircle size={20} /> Student Portal <ArrowRight size={16} />
            </motion.button>
          </Link>
          <Link to="/admin/login" style={{ textDecoration: 'none' }}>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="secondary"
              style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '1.2rem' }}
            >
              <ShieldCheck size={20} /> Admin Portal
            </motion.button>
          </Link>
        </div>
        
        <p className="text-muted" style={{ marginTop: '3rem', fontSize: '0.9rem' }}>
          &copy; 2026 Pace Management System. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default HomePage;
