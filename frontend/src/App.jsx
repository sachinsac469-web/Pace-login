import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import QRGenerator from './pages/admin/QRGenerator';
import AdminBatches from './pages/admin/AdminBatches';
import AdminExams from './pages/admin/AdminExams';
import AdminApproval from './pages/admin/AdminApproval';
import StudentLogin from './pages/student/StudentLogin';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentScanner from './pages/student/StudentScanner';
import AdminBatchDetails from './pages/admin/AdminBatchDetails';
import StudentList from './pages/admin/StudentList';

const ProtectedRoute = ({ children, roleRequired }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  if (roleRequired && user.role !== roleRequired) return <Navigate to="/" />;
  return children;
};

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roleRequired="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/qr-generator" element={
            <ProtectedRoute roleRequired="admin"><QRGenerator /></ProtectedRoute>
          } />
          <Route path="/admin/approval" element={
            <ProtectedRoute roleRequired="admin"><AdminApproval /></ProtectedRoute>
          } />
          <Route path="/admin/batches" element={
            <ProtectedRoute roleRequired="admin"><AdminBatches /></ProtectedRoute>
          } />
          <Route path="/admin/exams" element={
            <ProtectedRoute roleRequired="admin"><AdminExams /></ProtectedRoute>
          } />
          <Route path="/admin/batches/:id" element={
            <ProtectedRoute roleRequired="admin"><AdminBatchDetails /></ProtectedRoute>
          } />
          <Route path="/admin/students" element={
            <ProtectedRoute roleRequired="admin"><StudentList /></ProtectedRoute>
          } />

          {/* Student Routes */}
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/dashboard" element={
            <ProtectedRoute roleRequired="student"><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/student/scanner" element={
            <ProtectedRoute roleRequired="student"><StudentScanner /></ProtectedRoute>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
