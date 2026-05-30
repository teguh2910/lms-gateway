import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../api';

export default function Classes() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', subject_id: '', semester: 1, academic_year: '' });

  const load = async () => {
    const data = await apiGet('/classes?limit=50&offset=0');
    if (Array.isArray(data)) setItems(data);
    else setItems([]);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await apiPut(`/classes/${editing}`, form);
    } else {
      await apiPost('/classes', form);
    }
    setShowForm(false);
    setEditing(null);
    load();
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
        <h1>Classes</h1>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); }}>
          + New Class
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>{editing ? 'Edit Class' : 'Create Class'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Subject ID</label>
              <input value={form.subject_id} onChange={e => setForm({...form, subject_id: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Semester</label>
              <input type="number" value={form.semester} onChange={e => setForm({...form, semester: +e.target.value})} />
            </div>
            <div className="form-group">
              <label>Academic Year</label>
              <input value={form.academic_year} onChange={e => setForm({...form, academic_year: e.target.value})} />
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
            <tr><th>ID</th><th>Name</th><th>Description</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id as string}>
                <td>{item.id as string}</td>
                <td>{(item.field_3 || item.field_2 || '-') as string}</td>
                <td>{(item.field_4 || item.field_3 || '-') as string}</td>
                <td>
                  <button className="btn-sm" onClick={() => { setEditing(item.id as string); setShowForm(true); }}>Edit</button>
                  <button className="btn-sm btn-danger" onClick={() => handleDelete(item.id as string)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
