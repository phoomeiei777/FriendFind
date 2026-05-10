import { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, BookOpen, UsersRound, Heart, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const API_URL = 'http://localhost:5001/api/admin';

const COLORS = ['#FC8C75', '#FFB7A1', '#FFD1C1', '#FFE8E1', '#FFF2ED'];

export default function Dashboard() {
  const [stats, setStats] = useState({ 
    totalUsers: 0, 
    totalGroups: 0, 
    totalSubjects: 0, 
    totalMatches: 0,
    topSubjects: [] 
  });

  useEffect(() => {
    axios.get(`${API_URL}/dashboard`)
      .then(res => setStats(prev => ({ ...prev, ...res.data })))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="page-subtitle">Real-time statistics for FriendFind</p>
      </div>

      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#4F46E5' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Users</h3>
            <p>{stats.totalUsers}</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#10B981' }}>
            <Heart size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Matches</h3>
            <p>{stats.totalMatches}</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#F59E0B' }}>
            <BookOpen size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Subjects</h3>
            <p>{stats.totalSubjects}</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#EC4899' }}>
            <UsersRound size={24} />
          </div>
          <div className="stat-info">
            <h3>Study Groups</h3>
            <p>{stats.totalGroups}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="card chart-card">
          <div className="chart-header">
            <TrendingUp size={20} className="chart-icon" />
            <h3>Most Matched Subjects</h3>
          </div>
          <div style={{ width: '100%', height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.topSubjects || []} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis 
                  dataKey="subject_name" 
                  angle={-45} 
                  textAnchor="end" 
                  interval={0} 
                  height={80}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40}>
                  {(stats.topSubjects || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
