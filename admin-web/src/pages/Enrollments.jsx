import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5001/api';

export default function Enrollments() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadEnrollments = () => {
    axios.get(`${API_URL}/enrollments/admin`)
      .then(res => setEnrollments(res.data.enrollments || []))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadEnrollments();
  }, []);

  const handleStatusChange = (id, status) => {
    axios.patch(`${API_URL}/enrollments/admin/${id}`, { status })
      .then(() => loadEnrollments())
      .catch(err => {
        alert("Failed to update status");
        console.error(err);
      });
  };

  return (
    <div>
      <div className="header-actions">
        <h1>Enrollment Requests</h1>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading requests...</div>
        ) : enrollments.length === 0 ? (
          <div className="empty-state">No pending enrollment requests.</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>User</th>
                <th>Subject</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((req) => (
                <tr key={req.id}>
                  <td>{new Date(req.created_at).toLocaleString()}</td>
                  <td>
                    <div className="user-info">
                      <div className="user-name">{req.name || req.username}</div>
                      <div className="user-email">{req.email}</div>
                    </div>
                  </td>
                  <td>
                    <strong>{req.subject_code}</strong> - {req.subject_name}
                  </td>
                  <td>
                    <span className="badge badge-warning">Pending</span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn btn-primary" onClick={() => handleStatusChange(req.id, 'approved')}>
                        Approve
                      </button>
                      <button className="btn btn-outline" style={{ color: '#dc2626', borderColor: '#dc2626' }} onClick={() => handleStatusChange(req.id, 'rejected')}>
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
