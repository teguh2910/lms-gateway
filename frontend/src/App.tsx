import { useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate, useLocation } from 'react-router-dom';
import { isLoggedIn, logout, getRole, type Role } from './api';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Classes from './pages/Classes';
import MyClass from './pages/MyClass';
import Conferences from './pages/Conferences';
import Materials from './pages/Materials';
import Quizzes from './pages/Quizzes';
import Tasks from './pages/Tasks';
import Posts from './pages/Posts';
import Users from './pages/Users';
import {
  IconGrid, IconBook, IconUsers, IconVideo, IconFolder, IconQuiz,
  IconTask, IconChat, IconShield, IconLogout, IconBell, IconMenu, IconSparkle,
  IconSun, IconMoon,
} from './components/Icons';
import { useTheme } from './theme';
import './App.css';

type NavEntry = {
  to: string;
  label: string;
  icon: typeof IconGrid;
  roles: Role[];
};

const NAV: NavEntry[] = [
  { to: '/dashboard', label: 'Dashboard', icon: IconGrid, roles: ['admin', 'teacher', 'student'] },
  { to: '/subjects', label: 'Subjects', icon: IconBook, roles: ['admin', 'teacher', 'student'] },
  { to: '/classes', label: 'Classes', icon: IconUsers, roles: ['admin', 'teacher', 'student'] },
  { to: '/my-class', label: 'My Class', icon: IconUsers, roles: ['teacher', 'student'] },
  { to: '/conferences', label: 'Conferences', icon: IconVideo, roles: ['admin', 'teacher', 'student'] },
  { to: '/materials', label: 'Materials', icon: IconFolder, roles: ['admin', 'teacher', 'student'] },
  { to: '/quizzes', label: 'Quizzes', icon: IconQuiz, roles: ['admin', 'teacher', 'student'] },
  { to: '/tasks', label: 'Tasks', icon: IconTask, roles: ['admin', 'teacher', 'student'] },
  { to: '/posts', label: 'Posts', icon: IconChat, roles: ['admin', 'teacher', 'student'] },
  { to: '/users', label: 'Users', icon: IconShield, roles: ['admin'] },
];

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: Role[] }) {
  if (!isLoggedIn()) return <Navigate to="/login" />;
  if (roles && !roles.includes(getRole())) return <Navigate to="/dashboard" />;
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
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const name = localStorage.getItem('user_name') || 'User';
  const role = getRole();
  const email = localStorage.getItem('user_email') || '';
  const className = localStorage.getItem('class_name') || '';

  const navItems = NAV.filter((n) => n.roles.includes(role));
  const current = navItems.find((n) => n.to === location.pathname);
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
          {navItems.map(({ to, label, icon: Icon }) => (
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
              <span className="user-role">{role}{className ? ` · ${className}` : ''}</span>
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
            <span className={`role-chip role-${role}`}>{role}</span>
            <button
              className="icon-btn theme-toggle"
              onClick={toggle}
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
            </button>
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
        <Route path="/my-class" element={<ProtectedRoute roles={['teacher', 'student']}><Layout><MyClass /></Layout></ProtectedRoute>} />
        <Route path="/conferences" element={<ProtectedRoute><Layout><Conferences /></Layout></ProtectedRoute>} />
        <Route path="/materials" element={<ProtectedRoute><Layout><Materials /></Layout></ProtectedRoute>} />
        <Route path="/quizzes" element={<ProtectedRoute><Layout><Quizzes /></Layout></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Layout><Tasks /></Layout></ProtectedRoute>} />
        <Route path="/posts" element={<ProtectedRoute><Layout><Posts /></Layout></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute roles={['admin']}><Layout><Users /></Layout></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
