import React from 'react';
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card text-center" style={{ maxWidth: '500px', width: '100%' }}>
        <h1>Welcome to Pace</h1>
        <p className="mb-3" style={{ color: 'var(--primary-color)' }}>Student Management System</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/student/login" style={{ textDecoration: 'none' }}>
            <button style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>Student Portal</button>
          </Link>
          <Link to="/admin/login" style={{ textDecoration: 'none' }}>
            <button style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', backgroundColor: 'var(--text-dark)' }}>Admin Portal</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
