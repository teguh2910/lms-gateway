import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../api';

interface Subject {
  id: string;
  field_2?: string;
  field_3?: string;
  field_8?: string;
  field_9?: string;
  [key: string]: unknown;
}

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', code: '', sks: 3, default_semester: 1 });

  const load = async () => {
    const data = await apiGet('/subjects?limit=50&offset=0');
    if (Array.isArray(data)) setSubjects(data);
    else if (data?.id) setSubjects([data]);
    else setSubjects([]);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await apiPut(`/subjects/${editing}`, form);
    } else {
      await apiPost('/subjects', form);
    }
    setShowForm(false);
    setEditing(null);
    setForm({ name: '', code: '', sks: 3, default_semester: 1 });
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this subject?')) {
      await apiDelete(`/subjects/${id}`);
      load();
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Subjects</h1>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); }}>
          + New Subject
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>{editing ? 'Edit Subject' : 'Create Subject'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Code</label>
              <input value={form.code} onChange={e => setForm({...form, code: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>SKS</label>
              <input type="number" value={form.sks} onChange={e => setForm({...form, sks: +e.target.value})} />
            </div>
            <div className="form-group">
              <label>Default Semester</label>
              <input type="number" value={form.default_semester} onChange={e => setForm({...form, default_semester: +e.target.value})} />
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
            <tr><th>ID</th><th>Name</th><th>Code</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {subjects.map(s => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{String(s.field_9 || s.field_8 || '-')}</td>
                <td>{String(s.field_8 || s.field_7 || '-')}</td>
                <td>
                  <button className="btn-sm" onClick={() => { setEditing(s.id); setShowForm(true); }}>Edit</button>
                  <button className="btn-sm btn-danger" onClick={() => handleDelete(s.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
