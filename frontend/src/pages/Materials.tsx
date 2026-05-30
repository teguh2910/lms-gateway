import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../api';
import { IconPlus, IconEdit, IconTrash, IconDownload } from '../components/Icons';

interface Material {
  id: string;
  subject_class_id?: string;
  topic_subject_id?: string;
  type?: string;
  file_type?: string;
  name?: string;
  storage_id?: string;
  source?: string;
}

const emptyForm = {
  subject_class_id: '', topic_subject_id: '', type: 'FILE', file_type: 'pdf',
  name: '', storage_id: '', source: '',
};

export default function Materials() {
  const [items, setItems] = useState<Material[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState('');

  const load = async () => {
    const data = await apiGet('/materials?limit=50&offset=0');
    setItems(data?.materials || []);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = editing
      ? await apiPut(`/materials/${editing}`, form)
      : await apiPost('/materials', form);
    if (res?.error) { setError(res.error); return; }
    setShowForm(false);
    setEditing(null);
    setForm({ ...emptyForm });
    load();
  };

  const handleEdit = (m: Material) => {
    setEditing(m.id);
    setForm({
      subject_class_id: m.subject_class_id || '', topic_subject_id: m.topic_subject_id || '',
      type: m.type || 'FILE', file_type: m.file_type || 'pdf', name: m.name || '',
      storage_id: m.storage_id || '', source: m.source || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this material?')) {
      await apiDelete(`/materials/${id}`);
      load();
    }
  };

  const handleDownload = async (id: string) => {
    const res = await apiPost(`/materials/${id}/download`, {});
    if (res?.error) alert('Error: ' + res.error);
    else alert('Material marked as downloaded');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Materials</h1>
          <p className="subtitle">Upload and share learning resources</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); setForm({ ...emptyForm }); }}>
          <IconPlus /> New Material
        </button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      {showForm && (
        <div className="form-card">
          <h3>{editing ? 'Edit Material' : 'Create Material'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <input value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} />
              </div>
              <div className="form-group">
                <label>File Type</label>
                <input value={form.file_type} onChange={e => setForm({ ...form, file_type: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Subject Class ID</label>
              <input value={form.subject_class_id} onChange={e => setForm({ ...form, subject_class_id: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Topic Subject ID</label>
              <input value={form.topic_subject_id} onChange={e => setForm({ ...form, topic_subject_id: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Source (URL)</label>
              <input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} />
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
            <tr><th>Name</th><th>Type</th><th>File Type</th><th>Source</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={5} className="empty">No materials yet</td></tr>}
            {items.map((m) => (
              <tr key={m.id}>
                <td>{m.name}</td>
                <td>{m.type}</td>
                <td>{m.file_type}</td>
                <td>{m.source}</td>
                <td>
                  <button className="btn-sm" onClick={() => handleEdit(m)}><IconEdit /> Edit</button>
                  <button className="btn-sm btn-success" onClick={() => handleDownload(m.id)}><IconDownload /> Download</button>
                  <button className="btn-sm btn-danger" onClick={() => handleDelete(m.id)}><IconTrash /> Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
