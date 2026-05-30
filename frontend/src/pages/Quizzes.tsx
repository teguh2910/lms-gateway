import { useState } from 'react';
import { apiGet, apiPost, apiDelete } from '../api';
import { IconPlus } from '../components/Icons';

export default function Quizzes() {
  const [quizId, setQuizId] = useState('');
  const [quiz, setQuiz] = useState<Record<string, unknown> | null>(null);
  const [scores, setScores] = useState<Record<string, unknown>[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    subject_class_id: '', topic_subject_id: '', name: '', description: '', end_date: '',
  });

  const loadQuiz = async () => {
    if (!quizId) return;
    const data = await apiGet(`/quizzes/${quizId}`);
    setQuiz(data);
  };

  const loadScores = async () => {
    if (!quizId) return;
    const data = await apiGet(`/quizzes/${quizId}/scores`);
    setScores(data?.scores || []);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await apiPost('/quizzes', form);
    if (res?.error) { setError(res.error); return; }
    setShowForm(false);
    if (res?.id) setQuizId(res.id);
    alert('Quiz created: ' + (res?.id || ''));
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
        <div>
          <h1>Quizzes</h1>
          <p className="subtitle">Create assessments and review scores</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}><IconPlus /> New Quiz</button>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="search-bar">
        <input placeholder="Enter Quiz ID" value={quizId} onChange={e => setQuizId(e.target.value)} />
        <button className="btn-primary" onClick={loadQuiz}>Load</button>
        <button className="btn-secondary" onClick={loadScores}>View Scores</button>
      </div>

      {quiz && !quiz.error && (
        <div className="detail-card">
          <h3>{String(quiz.name || 'Quiz')}</h3>
          <p>{String(quiz.description || '')}</p>
          <p><strong>End date:</strong> {String(quiz.end_date || '-')}</p>
          <p><strong>Questions:</strong> {Array.isArray(quiz.question) ? quiz.question.length : 0}</p>
          <div className="form-actions">
            <button className="btn-sm btn-danger" onClick={handleDelete}>Delete</button>
          </div>
        </div>
      )}

      {scores.length > 0 && (
        <div className="table-container">
          <table>
            <thead><tr><th>Student ID</th><th>Score</th><th>Created</th></tr></thead>
            <tbody>
              {scores.map((s, i) => (
                <tr key={i}>
                  <td>{String(s.student_id)}</td>
                  <td>{String(s.score)}</td>
                  <td>{String(s.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="form-card">
          <h3>Create Quiz</h3>
          <form onSubmit={handleCreate}>
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
              <label>Topic Subject ID</label>
              <input value={form.topic_subject_id} onChange={e => setForm({ ...form, topic_subject_id: e.target.value })} />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input type="datetime-local" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} />
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
