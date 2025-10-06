import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }){
  const auth = useSelector(s=>s.auth);
  if(!auth || !auth.token) return <Navigate to="/login" replace />;
  return children;
}
