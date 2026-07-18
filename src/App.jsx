import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Purchases from './pages/Purchases';
import Transfers from './pages/Transfers';
import Assignments from './pages/Assignments';
import AuditLogs from './pages/AuditLogs';
import Assets from './pages/Assets';
import Expenditures from './pages/Expenditures';
import Settings from './pages/Settings';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f1d]">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 text-military-accent animate-spin mx-auto" />
          <p className="text-xs font-mono uppercase tracking-widest text-military-textMuted">Decrypting Node Access...</p>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
};

const App = () => {
  return (
    <>
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Secure Workspace Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'BaseCommander', 'LogisticsOfficer']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />

          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />


          
          <Route 
            path="/purchases" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'BaseCommander', 'LogisticsOfficer']}>
                <Purchases />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/transfers" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'BaseCommander', 'LogisticsOfficer']}>
                <Transfers />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/assignments" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'BaseCommander']}>
                <Assignments />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/audit-logs" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AuditLogs />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/assets" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'BaseCommander', 'LogisticsOfficer']}>
                <Assets />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/expenditures" 
            element={
              <ProtectedRoute allowedRoles={['Admin', 'BaseCommander', 'LogisticsOfficer']}>
                <Expenditures />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/settings" 
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <Settings />
              </ProtectedRoute>
            } 
          />

          {/* Fallback Catch-all Route */}

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
      
    </Router>
    </>
  );
};

export default App;
