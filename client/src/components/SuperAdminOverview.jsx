import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchComplaints } from '../store/slices/complaintsSlice';

export default function SuperAdminOverview() {
  const dispatch = useDispatch();
  const [admins, setAdmins] = useState([]);
  const [allComplaints, setAllComplaints] = useState([]);
  const [assigningComplaint, setAssigningComplaint] = useState(null);
  const [selectedAdmin, setSelectedAdmin] = useState('');

  useEffect(() => {
    fetchAdminOverview();
    dispatch(fetchComplaints());
  }, [dispatch]);

  const fetchAdminOverview = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/api/complaints/admin-overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching admin overview:', error);
    }
  };

  const handleAssignComplaint = async (complaintId) => {
    if (!selectedAdmin) {
      alert('Please select an admin');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/complaints/${complaintId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ admin_id: selectedAdmin })
      });

      const result = await response.json();
      if (result.ok) {
        alert('Complaint assigned successfully');
        fetchAdminOverview();
        dispatch(fetchComplaints());
        setAssigningComplaint(null);
        setSelectedAdmin('');
      } else {
        alert(result.error || 'Failed to assign complaint');
      }
    } catch (error) {
      alert('Error assigning complaint');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'status-open';
      case 'checked': return 'status-checked';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      default: return 'status-default';
    }
  };

  return (
    <div className="superadmin-overview">
      <h2>Admin Overview & Complaint Assignment</h2>
      
      <div className="admin-stats">
        <div className="stat-card">
          <h3>{admins.length}</h3>
          <p>Total Admins</p>
        </div>
        <div className="stat-card">
          <h3>{admins.reduce((total, admin) => total + (admin.assignedComplaints?.length || 0), 0)}</h3>
          <p>Total Assigned Complaints</p>
        </div>
        <div className="stat-card">
          <h3>{admins.reduce((total, admin) => total + (admin.assignedComplaints?.filter(c => c.status === 'open').length || 0), 0)}</h3>
          <p>Open Complaints</p>
        </div>
      </div>

      <div className="admin-sections">
        {admins.map(admin => (
          <div key={admin.user_id} className="admin-section">
            <div className="admin-header">
              <h3>{admin.first_name} {admin.last_name}</h3>
              <p>{admin.email}</p>
              <span className="admin-badge">Admin</span>
            </div>
            
            <div className="admin-complaints">
              <h4>Assigned Complaints ({admin.assignedComplaints?.length || 0})</h4>
              {admin.assignedComplaints?.length === 0 ? (
                <p className="no-complaints">No complaints assigned</p>
              ) : (
                <div className="complaints-list">
                  {admin.assignedComplaints.map(complaint => (
                    <div key={complaint.complaint_id} className="complaint-card admin-complaint-card">
                      <div className="complaint-header">
                        <span className={`status-badge ${getStatusColor(complaint.status)}`}>
                          {complaint.status.toUpperCase()}
                        </span>
                        <span className="complaint-id">#{complaint.complaint_id.slice(0, 8)}</span>
                      </div>
                      
                      <div className="complaint-content">
                        <p className="complaint-description">{complaint.description}</p>
                        <div className="complaint-meta">
                          <small>Created by: {complaint.user?.first_name} {complaint.user?.last_name}</small>
                          <small>Created: {new Date(complaint.created_at).toLocaleDateString()}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="unassigned-complaints">
        <h3>Unassigned Complaints</h3>
        <div className="complaints-list">
          {allComplaints.filter(c => !c.assigned_to).map(complaint => (
            <div key={complaint.complaint_id} className="complaint-card unassigned-card">
              <div className="complaint-header">
                <span className="status-badge status-open">UNASSIGNED</span>
                <span className="complaint-id">#{complaint.complaint_id.slice(0, 8)}</span>
              </div>
              
              <div className="complaint-content">
                <p className="complaint-description">{complaint.description}</p>
                <div className="complaint-meta">
                  <small>Created: {new Date(complaint.created_at).toLocaleDateString()}</small>
                </div>
              </div>

              <div className="complaint-actions">
                {assigningComplaint === complaint.complaint_id ? (
                  <div className="assign-form">
                    <select 
                      value={selectedAdmin} 
                      onChange={(e) => setSelectedAdmin(e.target.value)}
                      className="admin-select"
                    >
                      <option value="">Select Admin</option>
                      {admins.map(admin => (
                        <option key={admin.user_id} value={admin.user_id}>
                          {admin.first_name} {admin.last_name}
                        </option>
                      ))}
                    </select>
                    <div className="assign-buttons">
                      <button 
                        onClick={() => handleAssignComplaint(complaint.complaint_id)}
                        className="btn-assign"
                      >
                        Assign
                      </button>
                      <button 
                        onClick={() => {
                          setAssigningComplaint(null);
                          setSelectedAdmin('');
                        }}
                        className="btn-cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setAssigningComplaint(complaint.complaint_id)}
                    className="btn-assign"
                  >
                    Assign to Admin
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
