import { useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../api';

export default function Tasks() {
  const [taskId, setTaskId] = useState('');
  const [task, setTask] = useState<Record<string, unknown> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', class_id: '', due_date: '', max_score: 100, type: '' });

  const loadTask = async () => {
    if (!taskId) return;
    const data = await apiGet(`/tasks/${taskId}`);
    setTask(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiPost('/tasks', form);
    setShowForm(false);
    alert('Task created');
  };

  const handleUpdate = async () => {
    if (!taskId) return;
    await apiPut(`/tasks/${taskId}`, form);
    alert('Task updated');
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
    await apiPost(`/tasks/${taskId}/submit`, { file_url: '', notes: 'Submitted via UI' });
    alert('Task submitted');
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Tasks</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ New Task</button>
      </div>

      <div className="search-bar">
        <input placeholder="Enter Task ID" value={taskId} onChange={e => setTaskId(e.target.value)} />
        <button className="btn-primary" onClick={loadTask}>Load</button>
      </div>

      {task && (
        <div className="detail-card">
          <h3>Task Details</h3>
          <pre>{JSON.stringify(task, null, 2)}</pre>
          <div className="form-actions">
            <button className="btn-sm" onClick={handleUpdate}>Update</button>
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
              <label>Due Date</label>
              <input type="datetime-local" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Max Score</label>
              <input type="number" value={form.max_score} onChange={e => setForm({...form, max_score: +e.target.value})} />
            </div>
            <div className="form-group">
              <label>Type</label>
              <input value={form.type} onChange={e => setForm({...form, type: e.target.value})} />
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
