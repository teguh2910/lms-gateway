import { useState } from 'react';
import { apiGet, apiPost, can } from '../api';
import { IconPlus } from '../components/Icons';

const POST_TYPES = [
  { label: 'Diskusi', value: 'DISKUSI' },
  { label: 'Material', value: 'MATERIAL' },
  { label: 'Task', value: 'TASK' },
  { label: 'Conference', value: 'CONFERENCE' },
  { label: 'Quiz', value: 'QUIZ' },
  { label: 'Info', value: 'INFO' },
];

export default function Posts() {
  const [postId, setPostId] = useState('');
  const [post, setPost] = useState<Record<string, unknown> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    subject_class_id: '', topic_subject_id: '', title: '', description: '',
    type: 'DISKUSI', is_allow_to_comment: true, is_published: true,
  });

  const loadPost = async () => {
    if (!postId) return;
    const data = await apiGet(`/posts/${postId}`);
    setPost(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await apiPost('/posts', form);
    if (res?.error) { setError(res.error); return; }
    setShowForm(false);
    if (res?.id) setPostId(res.id);
    alert('Post created: ' + (res?.id || ''));
  };

  const handleUnpublish = async () => {
    if (!postId) return;
    await apiPost(`/posts/${postId}/unpublish`, {});
    alert('Post publish status toggled');
    loadPost();
  };

  const handleComment = async () => {
    if (!postId || !comment) return;
    const res = await apiPost(`/posts/${postId}/comment`, {
      student_id: localStorage.getItem('user_id'),
      student_name: localStorage.getItem('user_name') || 'Student',
      comment,
    });
    if (res?.error) { alert('Error: ' + res.error); return; }
    setComment('');
    alert('Comment added');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Posts</h1>
          <p className="subtitle">{can.managePosts() ? 'Share announcements and discussions' : 'Read posts and join discussions'}</p>
        </div>
        {can.managePosts() && <button className="btn-primary" onClick={() => setShowForm(true)}><IconPlus /> New Post</button>}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="search-bar">
        <input placeholder="Enter Post ID" value={postId} onChange={e => setPostId(e.target.value)} />
        <button className="btn-primary" onClick={loadPost}>Load</button>
      </div>

      {post && !post.error && (
        <div className="detail-card">
          <h3>{String(post.title || 'Post')}</h3>
          <p>{String(post.description || '')}</p>
          <p><strong>Type:</strong> {String(post.type || '-')}</p>
          <p><strong>Published:</strong> {String(post.is_published)}</p>
          <p><strong>Allow comments:</strong> {String(post.is_allow_to_comment)}</p>
          <div className="form-actions">
            <button className="btn-sm btn-danger" onClick={handleUnpublish}>Toggle Publish</button>
          </div>
          <div className="comment-section">
            <h4>Add Comment</h4>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Write a comment..." />
            <button className="btn-primary" onClick={handleComment}>Post Comment</button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="form-card">
          <h3>Create Post</h3>
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label>Title</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
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
              <label>Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {POST_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group checkbox">
              <label>
                <input type="checkbox" checked={form.is_allow_to_comment} onChange={e => setForm({ ...form, is_allow_to_comment: e.target.checked })} />
                Allow comments
              </label>
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
