import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete, can } from '../api';
import { IconPlus, IconEdit, IconTrash, IconVideo } from '../components/Icons';

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

interface Subject {
  id: string;
  name?: string;
  code?: string;
}

interface ClassItem {
  id: string;
  name?: string;
  code?: string;
}

interface SubjectClass {
  id: string;
  subject_id?: string;
  class_id?: string;
  name?: string;
}

const emptyForm = {
  subject_id: '', class_id: '', name: '', description: '',
  meeting_url: '', start_time: '', end_time: '',
};

export default function Conferences() {
  const [items, setItems] = useState<Conference[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState('');
  const manage = can.manageConferences();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjectClasses, setSubjectClasses] = useState<SubjectClass[]>([]);

  const load = async () => {
    const data = await apiGet('/conferences?limit=50&offset=0');
    setItems(data?.conferences || []);
  };

  const loadRefs = async () => {
    const [subData, clsData, scData] = await Promise.all([
      apiGet('/subjects?limit=200'),
      apiGet('/classes?limit=200'),
      apiGet('/subject-classes?limit=200'),
    ]);
    setSubjects(subData?.subjects || []);
    setClasses(clsData?.classes || []);
    setSubjectClasses(scData?.subject_classes || []);
  };

  useEffect(() => { load(); loadRefs(); }, []);

  const onSubjectChange = (id: string) => {
    setForm({ ...form, subject_id: id });
  };

  // Resolve or create subject_class_id from subject + class selection
  const resolveSubjectClassId = async (): Promise<string> => {
    const existing = subjectClasses.find(
      (sc) => sc.subject_id === form.subject_id && sc.class_id === form.class_id
    );
    if (existing) return existing.id;
    // Create a new subject-class link
    const subj = subjects.find((s) => s.id === form.subject_id);
    const res = await apiPost('/subject-classes', {
      subject_id: form.subject_id,
      class_id: form.class_id,
      name: subj?.name || '',
    });
    if (res?.id) {
      setSubjectClasses([...subjectClasses, res]);
      return res.id;
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.subject_id || !form.class_id) {
      setError('Please select both a subject and a class');
      return;
    }
    const scId = await resolveSubjectClassId();
    if (!scId) { setError('Failed to link subject and class'); return; }

    const payload = {
      subject_class_id: scId,
      name: form.name,
      description: form.description,
      meeting_url: form.meeting_url,
      start_time: form.start_time,
      end_time: form.end_time,
    };
    const res = editing
      ? await apiPut(`/conferences/${editing}`, payload)
      : await apiPost('/conferences', payload);
    if (res?.error) { setError(res.error); return; }
    setShowForm(false);
    setEditing(null);
    setForm({ ...emptyForm });
    load();
  };

  const handleEdit = (c: Conference) => {
    setEditing(c.id);
    // Reverse-lookup subject and class from subject_class_id
    const sc = subjectClasses.find((s) => s.id === c.subject_class_id);
    setForm({
      subject_id: sc?.subject_id || '', class_id: sc?.class_id || '',
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

  // Display helpers
  const scLabel = (scId?: string) => {
    const sc = subjectClasses.find((s) => s.id === scId);
    if (!sc) return scId || '—';
    const subj = subjects.find((s) => s.id === sc.subject_id);
    const cls = classes.find((c) => c.id === sc.class_id);
    return `${subj?.name || subj?.code || '?'} · ${cls?.name || cls?.code || '?'}`;
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Conferences</h1>
          <p className="subtitle">{manage ? 'Schedule and manage online meetings' : 'Join your class meetings'}</p>
        </div>
        {manage && (
          <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); setForm({ ...emptyForm }); }}>
            <IconPlus /> New Conference
          </button>
        )}
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
            <div className="form-row">
              <div className="form-group">
                <label>Subject</label>
                <select value={form.subject_id} onChange={e => onSubjectChange(e.target.value)}>
                  <option value="">— Select subject —</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name || s.code}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Class</label>
                <select value={form.class_id} onChange={e => setForm({ ...form, class_id: e.target.value })}>
                  <option value="">— Select class —</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name || c.code}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Meeting URL</label>
              <input value={form.meeting_url} onChange={e => setForm({ ...form, meeting_url: e.target.value })} placeholder="https://meet.google.com/..." />
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
            <tr><th>Name</th><th>Subject · Class</th><th>Status</th><th>Start</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={5} className="empty">No conferences yet</td></tr>}
            {items.map((c) => (
              <tr key={c.id}>
                <td>
                  <div className="cell-strong">{c.name}</div>
                  <div className="cell-sub">{c.description}</div>
                </td>
                <td>{scLabel(c.subject_class_id)}</td>
                <td><span className={`badge badge-${c.status === 'LIVE' ? 'teacher' : 'student'}`}>{c.status || 'SCHEDULED'}</span></td>
                <td>{c.start_time || '—'}</td>
                <td>
                  <button className="btn-sm btn-success" onClick={() => handleJoin(c.id)}><IconVideo size={14} /> Join</button>
                  {manage && <button className="btn-sm" onClick={() => handleEdit(c)}><IconEdit /> Edit</button>}
                  {manage && <button className="btn-sm btn-danger" onClick={() => handleDelete(c.id)}><IconTrash /> Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
