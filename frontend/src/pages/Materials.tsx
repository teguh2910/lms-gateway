import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete, can } from '../api';
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
  subject_id: '', class_id: '', type: 'FILE', file_type: 'pdf',
  name: '', storage_id: '', source: '',
};

export default function Materials() {
  const [items, setItems] = useState<Material[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [error, setError] = useState('');
  const manage = can.manageMaterials();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjectClasses, setSubjectClasses] = useState<SubjectClass[]>([]);

  const load = async () => {
    const data = await apiGet('/materials?limit=50&offset=0');
    setItems(data?.materials || []);
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
      type: form.type,
      file_type: form.file_type,
      name: form.name,
      storage_id: form.storage_id,
      source: form.source,
    };
    const res = editing
      ? await apiPut(`/materials/${editing}`, payload)
      : await apiPost('/materials', payload);
    if (res?.error) { setError(res.error); return; }
    setShowForm(false);
    setEditing(null);
    setForm({ ...emptyForm });
    load();
  };

  const handleEdit = (m: Material) => {
    setEditing(m.id);
    // Reverse-lookup subject and class from subject_class_id
    const sc = subjectClasses.find((s) => s.id === m.subject_class_id);
    setForm({
      subject_id: sc?.subject_id || '', class_id: sc?.class_id || '',
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
          <h1>Materials</h1>
          <p className="subtitle">{manage ? 'Upload and share learning resources' : 'Access your course materials'}</p>
        </div>
        {manage && (
          <button className="btn-primary" onClick={() => { setShowForm(true); setEditing(null); setForm({ ...emptyForm }); }}>
            <IconPlus /> New Material
          </button>
        )}
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
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  <option value="FILE">File</option>
                  <option value="LINK">Link</option>
                  <option value="VIDEO">Video</option>
                </select>
              </div>
              <div className="form-group">
                <label>File Type</label>
                <select value={form.file_type} onChange={e => setForm({ ...form, file_type: e.target.value })}>
                  <option value="pdf">PDF</option>
                  <option value="doc">DOC</option>
                  <option value="ppt">PPT</option>
                  <option value="xls">XLS</option>
                  <option value="mp4">MP4</option>
                  <option value="other">Other</option>
                </select>
              </div>
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
              <label>Source (URL)</label>
              <input value={form.source} onChange={e => setForm({ ...form, source: e.target.value })} placeholder="https://..." />
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
            <tr><th>Name</th><th>Subject · Class</th><th>Type</th><th>File Type</th><th>Source</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {items.length === 0 && <tr><td colSpan={6} className="empty">No materials yet</td></tr>}
            {items.map((m) => (
              <tr key={m.id}>
                <td><div className="cell-strong">{m.name}</div></td>
                <td>{scLabel(m.subject_class_id)}</td>
                <td>{m.type}</td>
                <td>{m.file_type}</td>
                <td>{m.source ? <a href={m.source} target="_blank" rel="noreferrer">Link</a> : '—'}</td>
                <td>
                  <button className="btn-sm btn-success" onClick={() => handleDownload(m.id)}><IconDownload /> Download</button>
                  {manage && <button className="btn-sm" onClick={() => handleEdit(m)}><IconEdit /> Edit</button>}
                  {manage && <button className="btn-sm btn-danger" onClick={() => handleDelete(m.id)}><IconTrash /> Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
