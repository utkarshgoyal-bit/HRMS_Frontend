import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import Payroll from './pages/Payroll';
import Settings from './pages/Settings';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import QRScan from './pages/QRScan';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Org Admin / Employee Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/attendance" element={<Attendance />} />
        <Route path="/settings" element={<Settings />} />

        {/* Super Admin Dashboard */}
        <Route path="/super-admin" element={<SuperAdminDashboard />} />

        {/* Public QR Scan Page */}
        <Route path="/scan/:token" element={<QRScan />} />

        {/* Redirect unknown paths to Login */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

