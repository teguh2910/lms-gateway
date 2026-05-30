import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../api';

export default function Materials() {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', description: '', class_id: '', type: '', file_url: '', content: '' });

  const load = async () => {
    const data = await apiGet('/materials?limit=50&offset=0');
    if (Array.isArray(data)) setItems(data);
    else setItems([]);
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      await apiPut(`/materials/${editing}`, form);
    } else {
      await apiPost('/materials', form);
    }
    setShowForm(false);
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this material?')) {
      await apiDelete(`/materials/${id}`);
      load();
    }
  };

  const handleDownload = async (id: string) => {
    await apiPost(`/materials/${id}/download`);
    alert('Material marked as downloaded');
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Materials</h1>
        <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); }}>
          + New Material
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h3>{editing ? 'Edit Material' : 'Create Material'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Class ID</label>
              <input value={form.class_id} onChange={e => setForm({...form, class_id: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Type</label>
              <input value={form.type} onChange={e => setForm({...form, type: e.target.value})} />
            </div>
            <div className="form-group">
              <label>File URL</label>
              <input value={form.file_url} onChange={e => setForm({...form, file_url: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} />
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
            <tr><th>ID</th><th>Title</th><th>Type</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id as string}>
                <td>{item.id as string}</td>
                <td>{(item.field_2 || item.field_3 || '-') as string}</td>
                <td>{(item.field_4 || '-') as string}</td>
                <td>
                  <button className="btn-sm" onClick={() => { setEditing(item.id as string); setShowForm(true); }}>Edit</button>
                  <button className="btn-sm btn-success" onClick={() => handleDownload(item.id as string)}>Download</button>
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
