import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchComplaints } from '../store/slices/complaintsSlice';
import { clearAuth } from '../store/slices/authSlice';
import CreateComplaint from '../components/CreateComplaint';
import UserComplaintList from '../components/UserComplaintList';

export default function UserDashboard() {
  const auth = useSelector(s => s.auth);
  const complaints = useSelector(s => s.complaints.list);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-complaints');

  const handleLogout = () => {
    dispatch(clearAuth());
    navigate('/login');
  };

  useEffect(() => {
    dispatch(fetchComplaints());
  }, [dispatch]);

  const myComplaints = complaints.filter(complaint => complaint.user_id === auth?.user?.user_id);

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <h1>User Dashboard</h1>
          <div className="user-info">
            Welcome, {auth?.user?.first_name} {auth?.user?.last_name}
            <span className="role-badge user-role">User</span>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </div>
        </div>
      </header>
      
      <div className="user-tabs">
        <button 
          className={activeTab === 'my-complaints' ? 'active' : ''}
          onClick={() => setActiveTab('my-complaints')}
        >
          My Complaints ({myComplaints.length})
        </button>
        <button 
          className={activeTab === 'file-complaint' ? 'active' : ''}
          onClick={() => setActiveTab('file-complaint')}
        >
          File New Complaint
        </button>
      </div>

      <main className="user-content">
        {activeTab === 'my-complaints' && (
          <UserComplaintList complaints={myComplaints} />
        )}
        {activeTab === 'file-complaint' && (
          <CreateComplaint />
        )}
      </main>
    </div>
  );
}
