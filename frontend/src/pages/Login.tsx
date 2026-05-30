import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../api';
import { IconSparkle } from '../components/Icons';

export default function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('teacher');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    const data = await apiPost('/auth/login', { email, password });
    setLoading(false);
    if (data.error) { setError(data.error); return; }
    storeSession(data);
    navigate('/dashboard');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const data = await apiPost('/auth/register', { email, password, name, role });
    if (data.error) { setLoading(false); setError(data.error); return; }
    const login = await apiPost('/auth/login', { email, password });
    setLoading(false);
    if (login.error) { setError(login.error); return; }
    storeSession(login);
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-aside">
        <div className="brand">
          <div className="brand-mark"><IconSparkle size={20} /></div>
          <div className="brand-text">
            <span className="brand-name">Edura</span>
            <span className="brand-sub">Learning Hub</span>
          </div>
        </div>

        <div className="login-aside-body">
          <h2>Teach, learn, and grow — all in one place.</h2>
          <p>A modern learning management platform for universities. Manage subjects, classes, materials, quizzes, and more.</p>
          <div className="login-features">
            <div className="login-feature"><span className="tick">✓</span> Organize subjects &amp; classes effortlessly</div>
            <div className="login-feature"><span className="tick">✓</span> Live conferences &amp; rich materials</div>
            <div className="login-feature"><span className="tick">✓</span> Quizzes, tasks &amp; auto-graded scoring</div>
          </div>
        </div>

        <p className="login-aside-foot">© {new Date().getFullYear()} Edura LMS. All rights reserved.</p>
      </div>

      <div className="login-main">
        <div className="login-box">
          <h1>{mode === 'login' ? 'Welcome back' : 'Create account'}</h1>
          <p>{mode === 'login' ? 'Sign in to continue to your dashboard.' : 'Get started with your new account.'}</p>

          {error && <div className="error-msg">{error}</div>}

          {mode === 'login' ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input id="email" type="email" placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Full name</label>
                <input value={name} placeholder="Jane Doe" onChange={e => setName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={role} onChange={e => setRole(e.target.value)}>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating…' : 'Create account'}
              </button>
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
            <p className="login-hint">Demo admin · admin@lms.com / admin123</p>
          )}
        </div>
      </div>
    </div>
  );
}
