import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete, can } from '../api';
import { IconPlus, IconEdit, IconTrash } from '../components/Icons';

interface Subject {
  id: string;
  university_id?: string;
  university_name?: string;
  faculty_id?: string;
  faculty_name?: string;
  programme_id?: string;
  programme_name?: string;
  code?: string;
  name?: string;
  sks?: number;
  default_semester?: number;
}

const emptyForm = {
  university_id: '', university_name: '', faculty_id: '', faculty_name: '',
  programme_id: '', programme_name: '', code: '', name: '', sks: 3, default_semester: 1,
};

export default function Subjects() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState('');
  const manage = can.manageSubjects();

  const load = async () => {
    const data = await apiGet('/subjects?limit=50&offset=0');
    setSubjects(data?.subjects || []);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = editing
      ? await apiPut(`/subjects/${editing}`, form)
      : await apiPost('/subjects', form);
    if (res?.error) { setError(res.error); return; }
    setShowForm(false);
    setEditing(null);
    setForm({ ...emptyForm });
    load();
  };

  const handleEdit = (s: Subject) => {
    setEditing(s.id);
    setForm({
      university_id: s.university_id || '', university_name: s.university_name || '',
      faculty_id: s.faculty_id || '', faculty_name: s.faculty_name || '',
      programme_id: s.programme_id || '', programme_name: s.programme_name || '',
      code: s.code || '', name: s.name || '', sks: s.sks || 3, default_semester: s.default_semester || 1,
    });
    setShowForm(true);
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
        <div>
          <h1>Subjects</h1>
          <p className="subtitle">{manage ? 'Manage course subjects and their topics' : 'Browse course subjects'}</p>
        </div>
        {manage && (
          <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); setForm({ ...emptyForm }); }}>
            <IconPlus /> New Subject
          </button>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="form-card">
          <h3>{editing ? 'Edit Subject' : 'Create Subject'}</h3>
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
            <div className="form-row">
              <div className="form-group">
                <label>SKS</label>
                <input type="number" value={form.sks} onChange={e => setForm({ ...form, sks: +e.target.value })} />
              </div>
              <div className="form-group">
                <label>Default Semester</label>
                <input type="number" value={form.default_semester} onChange={e => setForm({ ...form, default_semester: +e.target.value })} />
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
            <tr><th>Code</th><th>Name</th><th>SKS</th><th>Semester</th><th>Programme</th>{manage && <th>Actions</th>}</tr>
          </thead>
          <tbody>
            {subjects.length === 0 && (
              <tr><td colSpan={manage ? 6 : 5} className="empty">No subjects yet</td></tr>
            )}
            {subjects.map(s => (
              <tr key={s.id}>
                <td>{s.code}</td>
                <td>{s.name}</td>
                <td>{s.sks}</td>
                <td>{s.default_semester}</td>
                <td>{s.programme_name}</td>
                {manage && (
                  <td>
                    <button className="btn-sm" onClick={() => handleEdit(s)}><IconEdit /> Edit</button>
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(s.id)}><IconTrash /> Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
