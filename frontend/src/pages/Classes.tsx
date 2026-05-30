import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../api';
import { IconPlus, IconEdit, IconTrash } from '../components/Icons';

interface Class {
  id: string;
  university_id?: string;
  university_name?: string;
  faculty_id?: string;
  faculty_name?: string;
  programme_id?: string;
  programme_name?: string;
  code?: string;
  name?: string;
}

const emptyForm = {
  university_id: '', university_name: '', faculty_id: '', faculty_name: '',
  programme_id: '', programme_name: '', code: '', name: '',
};

export default function Classes() {
  const [items, setItems] = useState<Class[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState('');

  const load = async () => {
    const data = await apiGet('/classes?limit=50&offset=0');
    setItems(data?.classes || []);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = editing
      ? await apiPut(`/classes/${editing}`, form)
      : await apiPost('/classes', form);
    if (res?.error) { setError(res.error); return; }
    setShowForm(false);
    setEditing(null);
    setForm({ ...emptyForm });
    load();
  };

  const handleEdit = (c: Class) => {
    setEditing(c.id);
    setForm({
      university_id: c.university_id || '', university_name: c.university_name || '',
      faculty_id: c.faculty_id || '', faculty_name: c.faculty_name || '',
      programme_id: c.programme_id || '', programme_name: c.programme_name || '',
      code: c.code || '', name: c.name || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this class?')) {
      await apiDelete(`/classes/${id}`);
      load();
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Classes</h1>
          <p className="subtitle">Organize student classes by programme</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); setForm({ ...emptyForm }); }}>
          <IconPlus /> New Class
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="form-card">
          <h3>{editing ? 'Edit Class' : 'Create Class'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Code</label>
                <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>University ID</label>
                <input value={form.university_id} onChange={e => setForm({ ...form, university_id: e.target.value })} />
              </div>
              <div className="form-group">
                <label>University Name</label>
                <input value={form.university_name} onChange={e => setForm({ ...form, university_name: e.target.value })} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Programme ID</label>
                <input value={form.programme_id} onChange={e => setForm({ ...form, programme_id: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Programme Name</label>
                <input value={form.programme_name} onChange={e => setForm({ ...form, programme_name: e.target.value })} />
              </div>
            </div>
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
            <tr><th>Code</th><th>Name</th><th>Programme</th><th>University</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={5} className="empty">No classes yet</td></tr>}
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.code}</td>
                <td>{c.name}</td>
                <td>{c.programme_name}</td>
                <td>{c.university_name}</td>
                <td>
                  <button className="btn-sm" onClick={() => handleEdit(c)}><IconEdit /> Edit</button>
                  <button className="btn-sm btn-danger" onClick={() => handleDelete(c.id)}><IconTrash /> Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
