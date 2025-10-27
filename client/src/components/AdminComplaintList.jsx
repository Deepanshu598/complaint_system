import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchComplaints } from '../store/slices/complaintsSlice';

export default function AdminComplaintList({ complaints }) {
  const dispatch = useDispatch();
  const [resolvingComplaint, setResolvingComplaint] = useState(null);
  const [resolveComments, setResolveComments] = useState('');

  const handleResolve = async (complaintId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/complaints/${complaintId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comments: resolveComments })
      });

      const result = await response.json();
      if (result.ok) {
        alert('Complaint resolved successfully');
        dispatch(fetchComplaints());
        setResolvingComplaint(null);
        setResolveComments('');
      } else {
        alert(result.error || 'Failed to resolve complaint');
      }
    } catch (error) {
      alert('Error resolving complaint');
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
    <div className="admin-complaints">
      <h2>Complaint Management</h2>
      <div className="complaints-list">
        {complaints.length === 0 ? (
          <p>No complaints found</p>
        ) : (
          complaints.map(complaint => (
            <div key={complaint.complaint_id} className="complaint-card">
              <div className="complaint-header">
                <span className={`status-badge ${getStatusColor(complaint.status)}`}>
                  {complaint.status.toUpperCase()}
                </span>
                <span className="complaint-id">#{complaint.complaint_id.slice(0, 8)}</span>
              </div>
              
              <div className="complaint-content">
                <p className="complaint-description">{complaint.description}</p>
                <div className="complaint-meta">
                  <small>Created: {new Date(complaint.created_at).toLocaleDateString()}</small>
                  {complaint.updated_at !== complaint.created_at && (
                    <small>Updated: {new Date(complaint.updated_at).toLocaleDateString()}</small>
                  )}
                </div>
              </div>

              <div className="complaint-actions">
                {complaint.status === 'open' || complaint.status === 'checked' ? (
                  <div className="resolve-section">
                    {resolvingComplaint === complaint.complaint_id ? (
                      <div className="resolve-form">
                        <textarea
                          value={resolveComments}
                          onChange={(e) => setResolveComments(e.target.value)}
                          placeholder="Add resolution comments..."
                          rows="3"
                        />
                        <div className="resolve-buttons">
                          <button 
                            onClick={() => handleResolve(complaint.complaint_id)}
                            className="btn-resolve"
                          >
                            Confirm Resolve
                          </button>
                          <button 
                            onClick={() => {
                              setResolvingComplaint(null);
                              setResolveComments('');
                            }}
                            className="btn-cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setResolvingComplaint(complaint.complaint_id)}
                        className="btn-resolve"
                      >
                        Resolve Complaint
                      </button>
                    )}
                  </div>
                ) : (
                  <span className="resolved-text">Resolved</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
