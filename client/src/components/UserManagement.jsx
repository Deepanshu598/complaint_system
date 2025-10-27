import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchUsers } from '../store/slices/usersSlice';

export default function UserManagement({ users }) {
  const dispatch = useDispatch();
  const [promotingUser, setPromotingUser] = useState(null);

  const handlePromoteToAdmin = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/users/${userId}/promote-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.ok) {
        alert('User promoted to admin successfully');
        dispatch(fetchUsers());
        setPromotingUser(null);
      } else {
        alert(result.error || 'Failed to promote user');
      }
    } catch (error) {
      alert('Error promoting user');
    }
  };

  const handleDemoteAdmin = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/users/${userId}/demote-admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.ok) {
        alert('Admin demoted to regular user successfully');
        dispatch(fetchUsers());
        setPromotingUser(null);
      } else {
        alert(result.error || 'Failed to demote admin');
      }
    } catch (error) {
      alert('Error demoting admin');
    }
  };

  const getRoleColor = (roleName) => {
    switch (roleName) {
      case 'superadmin': return 'role-superadmin';
      case 'approver': return 'role-admin';
      case 'reviewer': return 'role-reviewer';
      case 'user': return 'role-user';
      default: return 'role-default';
    }
  };

  const regularUsers = users.filter(user => user.role?.role_name === 'user');
  const adminUsers = users.filter(user => user.role?.role_name === 'approver');
  const reviewerUsers = users.filter(user => user.role?.role_name === 'reviewer');

  return (
    <div className="user-management">
      <h2>Admin Management</h2>
      <div className="admin-info">
        <p>Manage your admin users. You can promote regular users to admin status or create new admin users.</p>
      </div>
      
      <div className="user-stats">
        <div className="stat-card">
          <h3>{regularUsers.length}</h3>
          <p>Regular Users</p>
        </div>
        <div className="stat-card">
          <h3>{adminUsers.length}</h3>
          <p>Admins</p>
        </div>
        <div className="stat-card">
          <h3>{reviewerUsers.length}</h3>
          <p>Reviewers</p>
        </div>
      </div>

      <div className="user-sections">
        <div className="user-section">
          <h3>Regular Users</h3>
          <div className="user-list">
            {regularUsers.length === 0 ? (
              <p>No regular users found</p>
            ) : (
              regularUsers.map(user => (
                <div key={user.user_id} className="user-card">
                  <div className="user-info">
                    <h4>{user.first_name} {user.last_name}</h4>
                    <p>{user.email}</p>
                    <span className={`role-badge ${getRoleColor(user.role?.role_name)}`}>
                      {user.role?.role_name}
                    </span>
                  </div>
                  <div className="user-actions">
                    {promotingUser === user.user_id ? (
                      <div className="promote-confirmation">
                        <p>Promote to Admin?</p>
                        <div className="promote-buttons">
                          <button 
                            onClick={() => handlePromoteToAdmin(user.user_id)}
                            className="btn-promote"
                          >
                            Yes, Promote
                          </button>
                          <button 
                            onClick={() => setPromotingUser(null)}
                            className="btn-cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setPromotingUser(user.user_id)}
                        className="btn-promote"
                      >
                        Promote to Admin
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="user-section">
          <h3>Admin Users</h3>
          <div className="user-list">
            {adminUsers.length === 0 ? (
              <p>No admin users found</p>
            ) : (
              adminUsers.map(user => (
                <div key={user.user_id} className="user-card admin-card">
                  <div className="user-info">
                    <h4>{user.first_name} {user.last_name}</h4>
                    <p>{user.email}</p>
                    <span className={`role-badge ${getRoleColor(user.role?.role_name)}`}>
                      {user.role?.role_name}
                    </span>
                  </div>
                  <div className="user-actions">
                    {promotingUser === user.user_id ? (
                      <div className="demote-confirmation">
                        <p>Demote to Regular User?</p>
                        <div className="demote-buttons">
                          <button 
                            onClick={() => handleDemoteAdmin(user.user_id)}
                            className="btn-demote"
                          >
                            Yes, Demote
                          </button>
                          <button 
                            onClick={() => setPromotingUser(null)}
                            className="btn-cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setPromotingUser(user.user_id)}
                        className="btn-demote"
                      >
                        Demote to User
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
