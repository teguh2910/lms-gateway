import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../api';
import { IconPlus, IconEdit, IconTrash } from '../components/Icons';

interface User {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  university_name?: string;
  program_studi_name?: string;
  is_active?: boolean;
}

const emptyForm = {
  email: '', password: '', name: '', role: 'student',
  university_id: '', university_name: '', program_studi_id: '', program_studi_name: '',
};

export default function Users() {
  const [items, setItems] = useState<User[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm, is_active: true });
  const [error, setError] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const load = async () => {
    const q = roleFilter ? `&role=${roleFilter}` : '';
    const data = await apiGet(`/users?limit=50&offset=0${q}`);
    setItems(data?.users || []);
  };

  useEffect(() => { load(); }, [roleFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    let res;
    if (editing) {
      res = await apiPut(`/users/${editing}`, {
        name: form.name, role: form.role,
        university_id: form.university_id, university_name: form.university_name,
        program_studi_id: form.program_studi_id, program_studi_name: form.program_studi_name,
        is_active: form.is_active,
      });
    } else {
      res = await apiPost('/auth/register', form);
    }
    if (res?.error) { setError(res.error); return; }
    setShowForm(false);
    setEditing(null);
    setForm({ ...emptyForm, is_active: true });
    load();
  };

  const handleEdit = (u: User) => {
    setEditing(u.id);
    setForm({
      ...emptyForm,
      name: u.name || '', role: u.role || 'student',
      university_name: u.university_name || '', program_studi_name: u.program_studi_name || '',
      is_active: u.is_active ?? true,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this user?')) {
      await apiDelete(`/users/${id}`);
      load();
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p className="subtitle">Manage accounts, roles and access</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); setForm({ ...emptyForm, is_active: true }); }}>
          <IconPlus /> New User
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="search-bar">
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="teacher">Teacher</option>
          <option value="student">Student</option>
        </select>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>{editing ? 'Edit User' : 'Create User'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            {!editing && (
              <>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                </div>
              </>
            )}
            <div className="form-group">
              <label>Role</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
            </div>
            {editing && (
              <div className="form-group checkbox">
                <label>
                  <input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} />
                  Active
                </label>
              </div>
            )}
            <div className="form-actions">
              <button type="submit" className="btn-primary">Save</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="table-container">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Active</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={5} className="empty">No users yet</td></tr>}
            {items.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`badge badge-${u.role}`}>{u.role}</span></td>
                <td>{u.is_active ? 'Yes' : 'No'}</td>
                <td>
                  <button className="btn-sm" onClick={() => handleEdit(u)}><IconEdit /> Edit</button>
                  <button className="btn-sm btn-danger" onClick={() => handleDelete(u.id)}><IconTrash /> Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
