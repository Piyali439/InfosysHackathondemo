import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreditAssessment from './pages/CreditAssessment';
import Loans from './pages/Loans';
import Demo from './pages/Demo';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route
          path="/*"
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="assessment" element={<CreditAssessment />} />
          <Route path="loans" element={<Loans />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;