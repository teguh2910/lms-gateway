import { useState } from 'react';
import { apiGet, apiPost, apiPut } from '../api';

export default function Posts() {
  const [postId, setPostId] = useState('');
  const [post, setPost] = useState<Record<string, unknown> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [comment, setComment] = useState('');
  const [form, setForm] = useState({ title: '', content: '', class_id: '', type: 'announcement', is_published: true });

  const loadPost = async () => {
    if (!postId) return;
    const data = await apiGet(`/posts/${postId}`);
    setPost(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await apiPost('/posts', form);
    setShowForm(false);
    alert('Post created');
  };

  const handleUpdate = async () => {
    if (!postId) return;
    await apiPut(`/posts/${postId}`, form);
    alert('Post updated');
  };

  const handleUnpublish = async () => {
    if (!postId) return;
    await apiPost(`/posts/${postId}/unpublish`);
    alert('Post unpublished');
  };

  const handleComment = async () => {
    if (!postId || !comment) return;
    await apiPost(`/posts/${postId}/comment`, { content: comment });
    setComment('');
    alert('Comment added');
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>Posts</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ New Post</button>
      </div>

      <div className="search-bar">
        <input placeholder="Enter Post ID" value={postId} onChange={e => setPostId(e.target.value)} />
        <button className="btn-primary" onClick={loadPost}>Load</button>
      </div>

      {post && (
        <div className="detail-card">
          <h3>Post Details</h3>
          <pre>{JSON.stringify(post, null, 2)}</pre>
          <div className="form-actions">
            <button className="btn-sm" onClick={handleUpdate}>Update</button>
            <button className="btn-sm btn-danger" onClick={handleUnpublish}>Unpublish</button>
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
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea value={form.content} onChange={e => setForm({...form, content: e.target.value})} required />
            </div>
            <div className="form-group">
              <label>Class ID</label>
              <input value={form.class_id} onChange={e => setForm({...form, class_id: e.target.value})} />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                <option value="announcement">Announcement</option>
                <option value="discussion">Discussion</option>
              </select>
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
