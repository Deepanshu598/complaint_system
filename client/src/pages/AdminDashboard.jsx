import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchComplaints } from '../store/slices/complaintsSlice';
import { fetchUsers } from '../store/slices/usersSlice';
import { clearAuth } from '../store/slices/authSlice';
import CreateUser from '../components/CreateUser';
import AdminComplaintList from '../components/AdminComplaintList';
import UserManagement from '../components/UserManagement';
import SuperAdminOverview from '../components/SuperAdminOverview';

export default function AdminDashboard() {
  const auth = useSelector(s => s.auth);
  const complaints = useSelector(s => s.complaints.list);
  const users = useSelector(s => s.users.list || []);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isSuperAdmin = auth?.user?.role?.role_name === 'superadmin';
  const isAdmin = auth?.user?.role?.role_name === 'approver' || isSuperAdmin;
  const [activeTab, setActiveTab] = useState(isSuperAdmin ? 'overview' : 'complaints');

  const handleLogout = () => {
    dispatch(clearAuth());
    navigate('/login');
  };

  useEffect(() => {
    dispatch(fetchComplaints());
    dispatch(fetchUsers());
  }, [dispatch]);

  if (!isAdmin) {
    return <div className="center">Access Denied. Admin privileges required.</div>;
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <div className="user-info">
            Welcome, {auth?.user?.first_name} {auth?.user?.last_name}
            <span className="role-badge">{auth?.user?.role?.role_name}</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </header>
      
      <div className="admin-tabs">
        {isSuperAdmin ? (
          <>
            <button 
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              Admin Overview
            </button>
            <button 
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              User Management
            </button>
            <button 
              className={activeTab === 'create-user' ? 'active' : ''}
              onClick={() => setActiveTab('create-user')}
            >
              Create Admin
            </button>
          </>
        ) : (
          <button 
            className={activeTab === 'complaints' ? 'active' : ''}
            onClick={() => setActiveTab('complaints')}
          >
            Manage Complaints
          </button>
        )}
      </div>

      <main className="admin-content">
        {activeTab === 'overview' && isSuperAdmin && (
          <SuperAdminOverview />
        )}
        {activeTab === 'complaints' && !isSuperAdmin && (
          <AdminComplaintList complaints={complaints} />
        )}
        {activeTab === 'users' && isSuperAdmin && (
          <UserManagement users={users} />
        )}
        {activeTab === 'create-user' && isSuperAdmin && (
          <CreateUser />
        )}
      </main>
    </div>
  );
}
