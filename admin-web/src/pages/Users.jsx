import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Trash2, Ban, ShieldCheck, Eye, X, Phone, Mail, Calendar, GraduationCap, Search, SlidersHorizontal, ChevronDown } from 'lucide-react';

const API_URL = 'http://localhost:5001/api/admin';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false); // toggle state

  // Filter states
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterFaculty, setFilterFaculty] = useState('all');
  const [filterYear, setFilterYear] = useState('all');

  const fetchUsers = () => {
    axios.get(`${API_URL}/users`)
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => { fetchUsers(); }, []);

  const getValidImageUrl = (url, username) => {
    if (!url || url.startsWith('file://')) {
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'User')}&background=random`;
    }
    return url;
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      axios.delete(`${API_URL}/users/${id}`)
        .then(() => fetchUsers())
        .catch(err => alert("Error deleting user"));
    }
  };

  const handleBan = (id, isCurrentlyBanned) => {
    const action = isCurrentlyBanned ? 'unban' : 'ban';
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      axios.put(`${API_URL}/users/${id}/ban`, { is_banned: !isCurrentlyBanned })
        .then(() => fetchUsers())
        .catch(err => alert(`Error ${action}ning user`));
    }
  };

  const openInspect = (user) => { setSelectedUser(user); setShowModal(true); };

  const faculties = useMemo(() => {
    const set = new Set(users.map(u => u.faculty).filter(Boolean));
    return [...set].sort();
  }, [users]);

  const years = useMemo(() => {
    const set = new Set(users.map(u => u.year).filter(Boolean));
    return [...set].sort();
  }, [users]);

  const filtered = useMemo(() => {
    return users.filter(u => {
      const q = search.toLowerCase();
      const matchSearch = !q ||
        u.username?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.faculty?.toLowerCase().includes(q);
      const matchStatus =
        filterStatus === 'all' ||
        (filterStatus === 'banned' && u.is_banned) ||
        (filterStatus === 'active' && !u.is_banned);
      const matchFaculty = filterFaculty === 'all' || u.faculty === filterFaculty;
      const matchYear = filterYear === 'all' || String(u.year) === String(filterYear);
      return matchSearch && matchStatus && matchFaculty && matchYear;
    });
  }, [users, search, filterStatus, filterFaculty, filterYear]);

  const hasFilter = search || filterStatus !== 'all' || filterFaculty !== 'all' || filterYear !== 'all';
  const activeFilterCount = [
    search,
    filterStatus !== 'all' ? filterStatus : '',
    filterFaculty !== 'all' ? filterFaculty : '',
    filterYear !== 'all' ? filterYear : '',
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch('');
    setFilterStatus('all');
    setFilterFaculty('all');
    setFilterYear('all');
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">Manage, ban, and verify user accounts</p>
      </div>

      <div className="card">
        {/* Toolbar: Search + Filter Toggle */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: showFilters ? 12 : 20 }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: '1 1 220px', minWidth: 180 }}>
            <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search username, email, faculty…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 38, height: 40, fontSize: 14 }}
            />
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(v => !v)}
            className="btn btn-secondary"
            style={{
              height: 40,
              fontSize: 13,
              padding: '0 14px',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              position: 'relative',
            }}
          >
            <SlidersHorizontal size={15} />
            Filters
            {activeFilterCount > 0 && (
              <span style={{
                background: 'var(--primary, #6366f1)',
                color: '#fff',
                borderRadius: '50%',
                width: 18,
                height: 18,
                fontSize: 11,
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: 2,
              }}>
                {activeFilterCount}
              </span>
            )}
            <ChevronDown
              size={14}
              style={{
                transition: 'transform 0.2s',
                transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            />
          </button>

          {/* Clear (only when filter active and panel hidden) */}
          {hasFilter && !showFilters && (
            <button onClick={clearFilters} className="btn btn-secondary" style={{ height: 40, fontSize: 13, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <X size={14} /> Clear
            </button>
          )}
        </div>

        {/* Collapsible Filter Panel */}
        {showFilters && (
          <div style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            flexWrap: 'wrap',
            padding: '12px 16px',
            background: 'var(--bg-subtle, #f8f9fa)',
            borderRadius: 8,
            marginBottom: 16,
            border: '1px solid var(--border, #e5e7eb)',
            animation: 'fadeIn 0.15s ease',
          }}>
            {/* Status filter */}
            <select
              className="form-control"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ height: 38, fontSize: 14, width: 'auto', paddingRight: 32, cursor: 'pointer' }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="banned">Banned</option>
            </select>

            {/* Faculty filter */}
            <select
              className="form-control"
              value={filterFaculty}
              onChange={e => setFilterFaculty(e.target.value)}
              style={{ height: 38, fontSize: 14, width: 'auto', paddingRight: 32, cursor: 'pointer' }}
            >
              <option value="all">All Faculties</option>
              {faculties.map(f => <option key={f} value={f}>{f}</option>)}
            </select>

            {/* Year filter */}
            <select
              className="form-control"
              value={filterYear}
              onChange={e => setFilterYear(e.target.value)}
              style={{ height: 38, fontSize: 14, width: 'auto', paddingRight: 32, cursor: 'pointer' }}
            >
              <option value="all">All Years</option>
              {years.map(y => <option key={y} value={y}>Year {y}</option>)}
            </select>

            {/* Spacer + Clear inside panel */}
            <div style={{ marginLeft: 'auto' }}>
              {hasFilter && (
                <button onClick={clearFilters} className="btn btn-secondary" style={{ height: 38, fontSize: 13, padding: '0 14px', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <X size={14} /> Clear all
                </button>
              )}
            </div>
          </div>
        )}

        {/* Result count */}
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>
          Showing <strong style={{ color: 'var(--text-main)' }}>{filtered.length}</strong> of {users.length} users
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Avatar</th>
                <th>Username</th>
                <th>Email</th>
                <th>Faculty</th>
                <th>Status</th>
                <th className="text-right" style={{ width: 140 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id}>
                  <td>
                    <img
                      src={getValidImageUrl(user.profile_image_url, user.username)}
                      alt={user.username}
                      className="user-avatar"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'User')}&background=random`;
                      }}
                    />
                  </td>
                  <td className="fw-bold">{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.faculty}</td>
                  <td>
                    {user.is_banned
                      ? <span className="badge badge-danger">Banned</span>
                      : <span className="badge badge-success">Active</span>
                    }
                  </td>
                  <td className="text-right">
                    <div className="action-buttons">
                      <button onClick={() => openInspect(user)} className="btn-icon" title="Inspect">
                        <Eye size={18} />
                      </button>
                      <button onClick={() => handleBan(user.id, user.is_banned)} className="btn-icon" title={user.is_banned ? 'Unban' : 'Ban'}>
                        {user.is_banned ? <ShieldCheck size={18} /> : <Ban size={18} />}
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="btn-icon" title="Delete">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center" style={{ padding: 48, color: 'var(--text-muted)' }}>
                    No users match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>User Inspection</h3>
              <button onClick={() => setShowModal(false)} className="close-btn"><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="user-detail-header">
                <img
                  src={getValidImageUrl(selectedUser.profile_image_url, selectedUser.username)}
                  alt={selectedUser.username}
                  className="detail-avatar"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedUser.username || 'User')}&background=random`;
                  }}
                />
                <div className="detail-title">
                  <h2>{selectedUser.username}</h2>
                  <p>User ID: #{selectedUser.id}</p>
                  {selectedUser.is_banned
                    ? <span className="badge badge-danger">Banned</span>
                    : <span className="badge badge-success">Active Account</span>
                  }
                </div>
              </div>
              <div className="detail-grid">
                <div className="detail-item">
                  <Mail size={16} />
                  <div><label>Email</label><p>{selectedUser.email}</p></div>
                </div>
                <div className="detail-item">
                  <Phone size={16} />
                  <div><label>Phone</label><p>{selectedUser.phone || 'Not provided'}</p></div>
                </div>
                <div className="detail-item">
                  <GraduationCap size={16} />
                  <div><label>Faculty / Year</label><p>{selectedUser.faculty} (Year {selectedUser.year})</p></div>
                </div>
                <div className="detail-item">
                  <Calendar size={16} />
                  <div><label>Joined Since</label><p>{new Date(selectedUser.created_at).toLocaleDateString()}</p></div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className={`btn ${selectedUser.is_banned ? 'btn-success' : 'btn-warning'}`}
                onClick={() => { handleBan(selectedUser.id, selectedUser.is_banned); setShowModal(false); }}
              >
                {selectedUser.is_banned ? 'Lift Ban' : 'Ban User'}
              </button>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}