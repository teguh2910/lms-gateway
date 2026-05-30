import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { isLoggedIn, logout } from './api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Classes from './pages/Classes';
import Conferences from './pages/Conferences';
import Materials from './pages/Materials';
import Quizzes from './pages/Quizzes';
import Tasks from './pages/Tasks';
import Posts from './pages/Posts';
import Users from './pages/Users';
import {
  IconGrid, IconBook, IconUsers, IconVideo, IconFolder, IconQuiz,
  IconTask, IconChat, IconShield, IconLogout, IconBell, IconMenu, IconSparkle,
} from './components/Icons';
import './App.css';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: IconGrid },
  { to: '/subjects', label: 'Subjects', icon: IconBook },
  { to: '/classes', label: 'Classes', icon: IconUsers },
  { to: '/conferences', label: 'Conferences', icon: IconVideo },
  { to: '/materials', label: 'Materials', icon: IconFolder },
  { to: '/quizzes', label: 'Quizzes', icon: IconQuiz },
  { to: '/tasks', label: 'Tasks', icon: IconTask },
  { to: '/posts', label: 'Posts', icon: IconChat },
  { to: '/users', label: 'Users', icon: IconShield },
];

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) return <Navigate to="/login" />;
  return <>{children}</>;
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'U';
}

function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const name = localStorage.getItem('user_name') || 'User';
  const role = localStorage.getItem('user_role') || 'student';
  const email = localStorage.getItem('user_email') || '';

  const current = NAV.find((n) => n.to === location.pathname);
  const title = current?.label || 'Dashboard';

  return (
    <div className="layout">
      <div className={`scrim ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />

      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="brand">
          <div className="brand-mark"><IconSparkle size={20} /></div>
          <div className="brand-text">
            <span className="brand-name">Edura</span>
            <span className="brand-sub">Learning Hub</span>
          </div>
        </div>

        <nav className="nav">
          <p className="nav-label">Menu</p>
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-foot">
          <div className="user-card">
            <div className="avatar">{initials(name)}</div>
            <div className="user-meta">
              <span className="user-name">{name}</span>
              <span className="user-role">{role}</span>
            </div>
          </div>
          <button onClick={logout} className="logout-btn" title="Logout">
            <IconLogout size={18} />
          </button>
        </div>
      </aside>

      <div className="content-wrap">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            <IconMenu />
          </button>
          <div className="topbar-title">
            <h1>{title}</h1>
            <span className="crumbs">Edura / {title}</span>
          </div>
          <div className="topbar-actions">
            <button className="icon-btn" aria-label="Notifications">
              <IconBell size={20} />
              <span className="dot" />
            </button>
            <div className="topbar-user">
              <div className="avatar sm">{initials(name)}</div>
              <div className="topbar-user-meta">
                <span className="user-name">{name}</span>
                <span className="user-email">{email}</span>
              </div>
            </div>
          </div>
        </header>

        <main className="main">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
        <Route path="/subjects" element={<ProtectedRoute><Layout><Subjects /></Layout></ProtectedRoute>} />
        <Route path="/classes" element={<ProtectedRoute><Layout><Classes /></Layout></ProtectedRoute>} />
        <Route path="/conferences" element={<ProtectedRoute><Layout><Conferences /></Layout></ProtectedRoute>} />
        <Route path="/materials" element={<ProtectedRoute><Layout><Materials /></Layout></ProtectedRoute>} />
        <Route path="/quizzes" element={<ProtectedRoute><Layout><Quizzes /></Layout></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Layout><Tasks /></Layout></ProtectedRoute>} />
        <Route path="/posts" element={<ProtectedRoute><Layout><Posts /></Layout></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Layout><Users /></Layout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
