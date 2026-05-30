import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../api';

interface Conference {
  id: string;
  subject_class_id?: string;
  topic_subject_id?: string;
  name?: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  meeting_url?: string;
  status?: string;
}

const emptyForm = {
  subject_class_id: '', topic_subject_id: '', name: '', description: '',
  meeting_url: '', start_time: '', end_time: '',
};

export default function Conferences() {
  const [items, setItems] = useState<Conference[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState('');

  const load = async () => {
    const data = await apiGet('/conferences?limit=50&offset=0');
    setItems(data?.conferences || []);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = editing
      ? await apiPut(`/conferences/${editing}`, form)
      : await apiPost('/conferences', form);
    if (res?.error) { setError(res.error); return; }
    setShowForm(false);
    setEditing(null);
    setForm({ ...emptyForm });
    load();
  };

  const handleEdit = (c: Conference) => {
    setEditing(c.id);
    setForm({
      subject_class_id: c.subject_class_id || '', topic_subject_id: c.topic_subject_id || '',
      name: c.name || '', description: c.description || '', meeting_url: c.meeting_url || '',
      start_time: c.start_time || '', end_time: c.end_time || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this conference?')) {
      await apiDelete(`/conferences/${id}`);
      load();
    }
  };

  const handleJoin = async (id: string) => {
    const res = await apiPost(`/conferences/${id}/join`, {
      student_id: localStorage.getItem('user_id'),
      student_name: localStorage.getItem('user_name') || 'Student',
    });
    if (res?.error) alert('Error: ' + res.error);
    else alert('Joined conference!');
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Conferences</h1>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); setForm({ ...emptyForm }); }}>
          + New Conference
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="form-card">
          <h3>{editing ? 'Edit Conference' : 'Create Conference'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Subject Class ID</label>
              <input value={form.subject_class_id} onChange={e => setForm({ ...form, subject_class_id: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Meeting URL</label>
              <input value={form.meeting_url} onChange={e => setForm({ ...form, meeting_url: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Time</label>
                <input type="datetime-local" value={form.start_time} onChange={e => setForm({ ...form, start_time: e.target.value })} />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input type="datetime-local" value={form.end_time} onChange={e => setForm({ ...form, end_time: e.target.value })} />
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
            <tr><th>Name</th><th>Description</th><th>Status</th><th>Start</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={5} className="empty">No conferences yet</td></tr>}
            {items.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.description}</td>
                <td>{c.status}</td>
                <td>{c.start_time}</td>
                <td>
                  <button className="btn-sm" onClick={() => handleEdit(c)}>Edit</button>
                  <button className="btn-sm btn-success" onClick={() => handleJoin(c.id)}>Join</button>
                  <button className="btn-sm btn-danger" onClick={() => handleDelete(c.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
