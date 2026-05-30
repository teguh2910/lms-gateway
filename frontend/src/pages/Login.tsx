import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../api';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('teacher');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const storeSession = (data: Record<string, unknown>) => {
    const user = (data.user || {}) as Record<string, unknown>;
    localStorage.setItem('token', String(data.token || ''));
    localStorage.setItem('user_id', String(user.id || ''));
    localStorage.setItem('university_id', String(user.university_id || ''));
    localStorage.setItem('program_studi_id', String(user.program_studi_id || ''));
    localStorage.setItem('user_name', String(user.name || ''));
    localStorage.setItem('user_email', String(user.email || ''));
    localStorage.setItem('user_role', String(user.role || ''));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const data = await apiPost('/auth/login', { email, password });
    if (data.error) { setError(data.error); return; }
    storeSession(data);
    navigate('/dashboard');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const data = await apiPost('/auth/register', { email, password, name, role });
    if (data.error) { setError(data.error); return; }
    // Auto-login after register
    const login = await apiPost('/auth/login', { email, password });
    if (login.error) { setError(login.error); return; }
    storeSession(login);
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>LMS Gateway</h1>
        <p>{mode === 'login' ? 'Sign in to your account' : 'Create a new account'}</p>
        {error && <div className="error-msg">{error}</div>}

        {mode === 'login' ? (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary">Sign In</button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label>Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select value={role} onChange={e => setRole(e.target.value)}>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">Register</button>
          </form>
        )}

        <p className="login-switch">
          {mode === 'login' ? (
            <>No account? <button className="link-btn" onClick={() => { setMode('register'); setError(''); }}>Register</button></>
          ) : (
            <>Have an account? <button className="link-btn" onClick={() => { setMode('login'); setError(''); }}>Sign In</button></>
          )}
        </p>

        {mode === 'login' && (
          <p className="login-hint">Default admin: admin@lms.com / admin123</p>
        )}
      </div>
    </div>
  );
}
