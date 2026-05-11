import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, BookOpen, Hash, CaseSensitive, Edit } from 'lucide-react';

const API_URL = 'http://localhost:5001/api/admin';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [editId, setEditId] = useState(null);

  const fetchSubjects = () => {
    axios.get(`${API_URL}/subjects`)
      .then(res => setSubjects(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      axios.delete(`${API_URL}/subjects/${id}`)
        .then(() => fetchSubjects())
        .catch(err => alert("Error deleting subject. It might be in use by groups."));
    }
  };

  const handleEditClick = (subject) => {
    setEditId(subject.id);
    setCode(subject.subject_code);
    setName(subject.subject_name);
  };

  const handleAddOrUpdate = (e) => {
    e.preventDefault();
    if (!code || !name) return alert("Please fill all fields");

    if (editId) {
      axios.put(`${API_URL}/subjects/${editId}`, { subject_code: code, subject_name: name })
        .then(() => {
          setCode('');
          setName('');
          setEditId(null);
          fetchSubjects();
        })
        .catch(err => alert("Error updating subject"));
    } else {
      axios.post(`${API_URL}/subjects`, { subject_code: code, subject_name: name })
        .then(() => {
          setCode('');
          setName('');
          fetchSubjects();
        })
        .catch(err => alert("Error adding subject (Code might already exist)"));
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Subject Management</h1>
        <p className="page-subtitle">Configure courses and subjects for matching</p>
      </div>

      {/* Add/Edit Subject Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header-simple">
          <BookOpen size={20} style={{ color: 'var(--primary)' }} />
          <h3>{editId ? 'Edit Subject' : 'Add New Subject'}</h3>
        </div>

        <form onSubmit={handleAddOrUpdate} className="add-subject-form">
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>

            {/* Subject Code */}
            <div style={{ width: 180, flexShrink: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                <Hash size={13} /> Subject Code
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. 1101105"
                value={code}
                onChange={e => setCode(e.target.value)}
              />
            </div>

            {/* Subject Name */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
                <CaseSensitive size={13} /> Subject Name
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Computer Programming"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            {/* Button */}
            <div style={{ flexShrink: 0, display: 'flex', gap: 8 }}>
              {editId && (
                <button type="button" className="btn btn-secondary" onClick={() => { setEditId(null); setCode(''); setName(''); }}>
                  Cancel
                </button>
              )}
              <button type="submit" className="btn btn-primary">
                {editId ? <><Edit size={18} /> Update Subject</> : <><Plus size={18} /> Add Subject</>}
              </button>
            </div>

          </div>
        </form>
      </div>

      {/* Table Card */}
      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th style={{ width: 70 }}>ID</th>
                <th style={{ width: 150 }}>Code</th>
                <th>Subject Name</th>
                <th className="text-center" style={{ width: 180 }}>Enrolled Users</th>
                <th className="text-right" style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map(subject => (
                <tr key={subject.id}>
                  <td className="text-muted">#{subject.id}</td>
                  <td className="fw-bold text-primary">{subject.subject_code}</td>
                  <td className="fw-bold">{subject.subject_name}</td>
                  <td className="text-center">
                    <span className="badge badge-warning">{subject.enrolled_count} Users</span>
                  </td>
                  <td className="text-right">
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEditClick(subject)} className="btn-icon" title="Edit">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(subject.id)} className="btn-icon text-danger" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    <div className="empty-state" style={{ padding: '48px 0' }}>
                      <BookOpen size={40} />
                      <p>No subjects found. Start by adding one above.</p>
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