import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, UsersRound, LogOut } from 'lucide-react';

export default function Sidebar({ onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon" style={{ 
          backgroundColor: '#FC8C75', 
          width: 32, 
          height: 32, 
          borderRadius: 8, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'white'
        }}>
          FF
        </div>
        FriendFind
      </div>
      <nav className="nav-links">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <LayoutDashboard size={20} />
          Dashboard
        </NavLink>
        <NavLink to="/users" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          Users
        </NavLink>
        <NavLink to="/subjects" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BookOpen size={20} />
          Subjects
        </NavLink>
        <NavLink to="/groups" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <UsersRound size={20} />
          Groups
        </NavLink>
        <NavLink to="/enrollments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BookOpen size={20} />
          Enrollments
        </NavLink>
      </nav>

      <div className="nav-links sidebar-footer">
        <button onClick={onLogout} className="nav-item btn-logout">
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </aside>
  );
}
