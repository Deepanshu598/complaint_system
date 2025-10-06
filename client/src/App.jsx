import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
const Login = lazy(()=>import('./pages/Login'));
const Signup = lazy(()=>import('./pages/Signup'));
const Dashboard = lazy(()=>import('./pages/Dashboard'));

export default function App(){
  return (
    <Suspense fallback={<div className="center">Loading...</div>}>
      <Routes>
        <Route path="/login" element={<Login/>} />
        <Route path="/signup" element={<Signup/>} />
        <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard/></ProtectedRoute>} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
