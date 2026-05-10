import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, UsersRound, Calendar, User, BookOpen } from 'lucide-react';

const API_URL = 'http://localhost:5001/api/admin';

export default function Groups() {
  const [groups, setGroups] = useState([]);

  const fetchGroups = () => {
    axios.get(`${API_URL}/groups`)
      .then(res => setGroups(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this study group?")) {
      axios.delete(`${API_URL}/groups/${id}`)
        .then(() => fetchGroups())
        .catch(err => alert("Error deleting group"));
    }
  };

  return (
    <div className="groups-page">
      <div className="page-header">
        <h1 className="page-title">Study Group Management</h1>
        <p className="page-subtitle">Monitor and manage user-created study groups</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th width="80">ID</th>
                <th>Group Title</th>
                <th>Subject</th>
                <th>Creator</th>
                <th>Members</th>
                <th width="120" style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(group => (
                <tr key={group.id}>
                  <td className="text-muted">#{group.id}</td>
                  <td>
                    <div className="fw-bold">{group.title}</div>
                    <div className="text-muted" style={{ fontSize: 12 }}>
                      <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                      {new Date(group.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="badge badge-success" style={{ marginBottom: 4 }}>{group.subject_code}</div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{group.subject_name}</div>
                  </td>
                  <td>
                    <div className="flex-align-center" style={{ gap: 8 }}>
                      <User size={14} className="text-primary" />
                      <span className="fw-bold">{group.creator_name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${group.current_members >= group.member_limit ? 'badge-danger' : 'badge-warning'}`}>
                      {group.current_members} / {group.member_limit || '∞'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button onClick={() => handleDelete(group.id)} className="btn-icon text-danger" title="Delete">
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {groups.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '64px' }}>
                    <div className="empty-state">
                      <UsersRound size={48} className="text-muted" />
                      <p>No study groups found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
