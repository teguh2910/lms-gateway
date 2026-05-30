import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiPost } from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await apiPost('/auth/login', { email, password });
      if (data.error) {
        setError(data.error);
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user_id', data.user_id);
      localStorage.setItem('university_id', data.university_id);
      localStorage.setItem('program_studi_id', data.program_studi_id);
      localStorage.setItem('user_name', data.name);
      localStorage.setItem('user_email', data.email);
      localStorage.setItem('user_role', data.role);
      navigate('/dashboard');
    } catch {
      setError('Login failed');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>LMS Gateway</h1>
        <p>Sign in to your account</p>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email}
              onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={password}
              onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary">Sign In</button>
        </form>
      </div>
    </div>
  );
}
