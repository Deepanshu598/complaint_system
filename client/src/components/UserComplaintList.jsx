import React from 'react';

export default function UserComplaintList({ complaints }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'status-open';
      case 'checked': return 'status-checked';
      case 'resolved': return 'status-resolved';
      case 'closed': return 'status-closed';
      default: return 'status-default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'open': return 'Open - Under Review';
      case 'checked': return 'Checked - Being Processed';
      case 'resolved': return 'Resolved - Issue Fixed';
      case 'closed': return 'Closed - No Action Required';
      default: return status;
    }
  };

  return (
    <div className="user-complaints">
      <h2>My Complaints</h2>
      <div className="complaints-list">
        {complaints.length === 0 ? (
          <div className="no-complaints">
            <p>You haven't filed any complaints yet.</p>
            <p>Click on "File New Complaint" to create your first complaint.</p>
          </div>
        ) : (
          complaints.map(complaint => (
            <div key={complaint.complaint_id} className="complaint-card user-complaint-card">
              <div className="complaint-header">
                <span className={`status-badge ${getStatusColor(complaint.status)}`}>
                  {complaint.status.toUpperCase()}
                </span>
                <span className="complaint-id">#{complaint.complaint_id.slice(0, 8)}</span>
              </div>
              
              <div className="complaint-content">
                <p className="complaint-description">{complaint.description}</p>
                <div className="complaint-status-info">
                  <p className="status-text">{getStatusText(complaint.status)}</p>
                </div>
                <div className="complaint-meta">
                  <small>Filed: {new Date(complaint.created_at).toLocaleDateString()}</small>
                  {complaint.updated_at !== complaint.created_at && (
                    <small>Last Updated: {new Date(complaint.updated_at).toLocaleDateString()}</small>
                  )}
                </div>
              </div>

              <div className="complaint-actions">
                {complaint.status === 'resolved' && (
                  <span className="resolved-badge">✓ Resolved</span>
                )}
                {complaint.status === 'closed' && (
                  <span className="closed-badge">✗ Closed</span>
                )}
                {(complaint.status === 'open' || complaint.status === 'checked') && (
                  <span className="processing-badge">⏳ Processing</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
