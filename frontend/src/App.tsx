import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
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
import './App.css';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isLoggedIn()) return <Navigate to="/login" />;
  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>LMS</h2>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/subjects">Subjects</Link>
          <Link to="/classes">Classes</Link>
          <Link to="/conferences">Conferences</Link>
          <Link to="/materials">Materials</Link>
          <Link to="/quizzes">Quizzes</Link>
          <Link to="/tasks">Tasks</Link>
          <Link to="/posts">Posts</Link>
          <Link to="/users">Users</Link>
        </nav>
        <div className="sidebar-footer">
          <button onClick={logout} className="btn-logout">Logout</button>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
        } />
        <Route path="/subjects" element={
          <ProtectedRoute><Layout><Subjects /></Layout></ProtectedRoute>
        } />
        <Route path="/classes" element={
          <ProtectedRoute><Layout><Classes /></Layout></ProtectedRoute>
        } />
        <Route path="/conferences" element={
          <ProtectedRoute><Layout><Conferences /></Layout></ProtectedRoute>
        } />
        <Route path="/materials" element={
          <ProtectedRoute><Layout><Materials /></Layout></ProtectedRoute>
        } />
        <Route path="/quizzes" element={
          <ProtectedRoute><Layout><Quizzes /></Layout></ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute><Layout><Tasks /></Layout></ProtectedRoute>
        } />
        <Route path="/posts" element={
          <ProtectedRoute><Layout><Posts /></Layout></ProtectedRoute>
        } />
        <Route path="/users" element={
          <ProtectedRoute><Layout><Users /></Layout></ProtectedRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
