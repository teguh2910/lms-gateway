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
  class_id?: string;
  class_name?: string;
  nim?: string;
  is_active?: boolean;
}

const emptyForm = {
  email: '', password: '', name: '', role: 'student',
  university_id: '', university_name: '', program_studi_id: '', program_studi_name: '',
  class_id: '', class_name: '', nim: '',
};

export default function Users() {
  const [items, setItems] = useState<User[]>([]);
  const [classes, setClasses] = useState<{ id: string; name?: string; code?: string }[]>([]);
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

  const loadClasses = async () => {
    const data = await apiGet('/classes?limit=100');
    setClasses(data?.classes || []);
  };

  useEffect(() => { load(); }, [roleFilter]);
  useEffect(() => { loadClasses(); }, []);

  const onClassChange = (id: string) => {
    const found = classes.find((c) => c.id === id);
    setForm({ ...form, class_id: id, class_name: found ? (found.name || found.code || '') : '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    let res;
    if (editing) {
      res = await apiPut(`/users/${editing}`, {
        name: form.name, role: form.role,
        university_id: form.university_id, university_name: form.university_name,
        program_studi_id: form.program_studi_id, program_studi_name: form.program_studi_name,
        class_id: form.class_id, class_name: form.class_name, nim: form.nim,
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
      class_id: u.class_id || '', class_name: u.class_name || '', nim: u.nim || '',
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

  const isStudent = form.role === 'student';

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Users</h1>
          <p className="subtitle">Manage accounts, roles, classes and access</p>
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
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="admin">Admin</option>
                  <option value="teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
              </div>
            </div>

            {!editing && (
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                </div>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label>{isStudent ? 'NIM (Student No.)' : 'NIP (Staff No.)'}</label>
                <input value={form.nim} onChange={e => setForm({ ...form, nim: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Class</label>
                <select value={form.class_id} onChange={e => onClassChange(e.target.value)}>
                  <option value="">— No class —</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || c.code}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Programme</label>
                <input value={form.program_studi_name} onChange={e => setForm({ ...form, program_studi_name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>University</label>
                <input value={form.university_name} onChange={e => setForm({ ...form, university_name: e.target.value })} />
              </div>
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
            <tr><th>Name</th><th>NIM/NIP</th><th>Class</th><th>Role</th><th>Active</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={6} className="empty">No users yet</td></tr>}
            {items.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="cell-strong">{u.name}</div>
                  <div className="cell-sub">{u.email}</div>
                </td>
                <td>{u.nim || '—'}</td>
                <td>{u.class_name || '—'}</td>
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
