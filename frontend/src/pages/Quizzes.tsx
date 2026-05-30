import { useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../api';

export default function Quizzes() {
  const [quizId, setQuizId] = useState('');
  const [quiz, setQuiz] = useState<Record<string, unknown> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', class_id: '', duration_minutes: 60, start_time: '', end_time: '' });

  const loadQuiz = async () => {
    if (!quizId) return;
    const data = await apiGet(`/quizzes/${quizId}`);
    setQuiz(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiPost('/quizzes', form);
    setShowForm(false);
    alert('Quiz created');
  };

  const handleUpdate = async () => {
    if (!quizId) return;
    await apiPut(`/quizzes/${quizId}`, form);
    alert('Quiz updated');
  };

  const handleDelete = async () => {
    if (!quizId) return;
    if (confirm('Delete this quiz?')) {
      await apiDelete(`/quizzes/${quizId}`);
      setQuiz(null);
      alert('Quiz deleted');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Quizzes</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ New Quiz</button>
      </div>

      <div className="search-bar">
        <input placeholder="Enter Quiz ID" value={quizId} onChange={e => setQuizId(e.target.value)} />
        <button className="btn-primary" onClick={loadQuiz}>Load</button>
      </div>

      {quiz && (
        <div className="detail-card">
          <h3>Quiz Details</h3>
          <pre>{JSON.stringify(quiz, null, 2)}</pre>
          <div className="form-actions">
            <button className="btn-sm" onClick={handleUpdate}>Update</button>
            <button className="btn-sm btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="form-card">
          <h3>Create Quiz</h3>
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
              <label>Duration (minutes)</label>
              <input type="number" value={form.duration_minutes} onChange={e => setForm({...form, duration_minutes: +e.target.value})} />
            </div>
            <div className="form-group">
              <label>Start Time</label>
              <input type="datetime-local" value={form.start_time} onChange={e => setForm({...form, start_time: e.target.value})} />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input type="datetime-local" value={form.end_time} onChange={e => setForm({...form, end_time: e.target.value})} />
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
