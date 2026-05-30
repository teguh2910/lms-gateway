import { useState } from 'react';
import { apiGet, apiPost, apiDelete } from '../api';

export default function Tasks() {
  const [taskId, setTaskId] = useState('');
  const [task, setTask] = useState<Record<string, unknown> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    subject_class_id: '', type: 'TUGAS', name: '', description: '', end_date: '',
  });

  const loadTask = async () => {
    if (!taskId) return;
    const data = await apiGet(`/tasks/${taskId}`);
    setTask(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await apiPost('/tasks', form);
    if (res?.error) { setError(res.error); return; }
    setShowForm(false);
    if (res?.id) setTaskId(res.id);
    alert('Task created: ' + (res?.id || ''));
  };

  const handleDelete = async () => {
    if (!taskId) return;
    if (confirm('Delete this task?')) {
      await apiDelete(`/tasks/${taskId}`);
      setTask(null);
      alert('Task deleted');
    }
  };

  const handleSubmit = async () => {
    if (!taskId) return;
    const res = await apiPost(`/tasks/${taskId}/submit`, {
      student_id: localStorage.getItem('user_id'),
      answer: 'Submitted via UI',
    });
    if (res?.error) alert('Error: ' + res.error);
    else alert('Task submitted');
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Tasks</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ New Task</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="search-bar">
        <input placeholder="Enter Task ID" value={taskId} onChange={e => setTaskId(e.target.value)} />
        <button className="btn-primary" onClick={loadTask}>Load</button>
      </div>

      {task && !task.error && (
        <div className="detail-card">
          <h3>{String(task.name || 'Task')}</h3>
          <p>{String(task.description || '')}</p>
          <p><strong>Type:</strong> {String(task.type || '-')}</p>
          <p><strong>Due:</strong> {String(task.end_date || '-')}</p>
          <div className="form-actions">
            <button className="btn-sm btn-success" onClick={handleSubmit}>Submit</button>
            <button className="btn-sm btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="form-card">
          <h3>Create Task</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Subject Class ID</label>
              <input value={form.subject_class_id} onChange={e => setForm({ ...form, subject_class_id: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Type</label>
                <input value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="datetime-local" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Create</button>
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
