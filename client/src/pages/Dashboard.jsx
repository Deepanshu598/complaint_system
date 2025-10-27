import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchComplaints } from '../store/slices/complaintsSlice';
import { fetchUsers } from '../store/slices/usersSlice';
import { setAuth } from '../store/slices/authSlice';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';

export default function Dashboard(){
  const auth = useSelector(s=>s.auth);
  const dispatch = useDispatch();
  const [config, setConfig] = useState(null);

  useEffect(()=>{
    if(!auth || !auth.user) return;
    const url = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:4000';
    fetch(`${url}/api/users/${auth.user.user_id}/screen-config`, { headers: { Authorization: 'Bearer '+auth.token } })
      .then(r=>{
        if(!r.ok) return r.text().then(t=>{ console.error('screen-config error', t); return null; });
        return r.json();
      })
      .then(cfg=>{ if(cfg) setConfig(cfg); });
  },[auth]);
  
  useEffect(()=>{ 
    dispatch(fetchComplaints()); 
    dispatch(fetchUsers());
    refreshUserInfo();
  },[dispatch]);

  const refreshUserInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch('http://localhost:4000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const userData = await response.json();
        // Update the user in Redux store with fresh data
        dispatch(setAuth({ token, user: userData }));
      }
    } catch (error) {
      console.error('Error refreshing user info:', error);
    }
  };

  if (!auth || !auth.user) {
    return <div className="center">Loading...</div>;
  }

  const userRole = auth.user.role?.role_name;
  
  if (userRole === 'superadmin' || userRole === 'approver') {
    return <AdminDashboard />;
  } else {
    return <UserDashboard />;
  }
}
