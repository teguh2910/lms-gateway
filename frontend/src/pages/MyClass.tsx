import { useEffect, useState } from 'react';
import { apiGet, currentUser } from '../api';
import { IconUsers } from '../components/Icons';

interface Member {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  nim?: string;
  is_active?: boolean;
}

function initials(name: string) {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('') || 'U'
  );
}

export default function MyClass() {
  const user = currentUser();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      if (!user.classId) {
        setLoading(false);
        return;
      }
      const data = await apiGet(`/users?class_id=${user.classId}&limit=200&offset=0`);
      if (active) {
        setMembers(data?.users || []);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const teachers = members.filter((m) => m.role === 'teacher' || m.role === 'admin');
  const students = members
    .filter((m) => m.role === 'student')
    .sort((a, b) => (a.nim || '').localeCompare(b.nim || ''));

  if (!user.classId) {
    return (
      <div className="page">
        <div className="page-header">
          <div>
            <h1>My Class</h1>
            <p className="subtitle">Your classmates and lecturers</p>
          </div>
        </div>
        <p className="role-note">
          You are not assigned to a class yet. Ask an administrator to add you to a class to see
          your classmates here.
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>My Class</h1>
          <p className="subtitle">
            {user.className || 'Your class'}
            {user.programStudiName ? ` · ${user.programStudiName}` : ''}
            {user.universityName ? ` · ${user.universityName}` : ''}
          </p>
        </div>
        <span className="role-chip role-student">
          <IconUsers size={16} /> {members.length} member{members.length === 1 ? '' : 's'}
        </span>
      </div>

      {loading && <p className="empty">Loading class roster…</p>}

      {!loading && (
        <>
          {teachers.length > 0 && (
            <div className="panel">
              <h3>Lecturers</h3>
              <div className="quick-grid">
                {teachers.map((m) => (
                  <div key={m.id} className="user-card">
                    <div className="avatar">{initials(m.name || '')}</div>
                    <div className="user-meta">
                      <span className="user-name">{m.name}</span>
                      <span className="user-role">{m.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="panel">
            <h3>Students</h3>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>NIM</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 && (
                    <tr>
                      <td colSpan={4} className="empty">
                        No students enrolled in this class yet
                      </td>
                    </tr>
                  )}
                  {students.map((m) => (
                    <tr key={m.id} className={m.id === user.id ? 'row-self' : ''}>
                      <td>{m.nim || '—'}</td>
                      <td>
                        <div className="cell-strong">
                          {m.name}
                          {m.id === user.id && <span className="badge badge-student"> You</span>}
                        </div>
                      </td>
                      <td>{m.email}</td>
                      <td>{m.is_active ? 'Active' : 'Inactive'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
