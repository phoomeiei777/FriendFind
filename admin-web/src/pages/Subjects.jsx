import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Plus, BookOpen, Hash, CaseSensitive } from 'lucide-react';

const API_URL = 'http://localhost:5001/api/admin';

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');

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

  const handleAdd = (e) => {
    e.preventDefault();
    if (!code || !name) return alert("Please fill all fields");

    axios.post(`${API_URL}/subjects`, { subject_code: code, subject_name: name })
      .then(() => {
        setCode('');
        setName('');
        fetchSubjects();
      })
      .catch(err => alert("Error adding subject (Code might already exist)"));
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Subject Management</h1>
        <p className="page-subtitle">Configure courses and subjects for matching</p>
      </div>

      {/* Add Subject Card */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-header-simple">
          <BookOpen size={20} style={{ color: 'var(--primary)' }} />
          <h3>Add New Subject</h3>
        </div>

        <form onSubmit={handleAdd} className="add-subject-form">
          {/*
            align-items: flex-end makes all children bottom-align.
            Labels push inputs down naturally — button has no label so it sits flush at the bottom.
            This avoids any padding/margin hacks.
          */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>

            {/* Subject Code — fixed width */}
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

            {/* Subject Name — grows to fill */}
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

            {/* Button — no label, bottom-aligns via flex-end */}
            <div style={{ flexShrink: 0 }}>
              <button type="submit" className="btn btn-primary">
                <Plus size={18} /> Add Subject
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
                <th className="text-right" style={{ width: 100 }}>Actions</th>
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
                    <button onClick={() => handleDelete(subject.id)} className="btn-icon" title="Delete">
                      <Trash2 size={16} />
                    </button>
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