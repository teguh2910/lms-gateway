import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet, currentUser, can } from '../api';
import {
  IconBook, IconUsers, IconVideo, IconFolder, IconQuiz, IconTask, IconChat, IconShield,
} from '../components/Icons';
interface Stat {
  key: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  cls: string;
  to: string;
  endpoint: string;
  hint: string;
}

const ADMIN_STATS: Stat[] = [
  { key: 'users', label: 'Users', icon: IconShield, cls: 'i4', to: '/users', endpoint: '/users?limit=1', hint: 'Registered users' },
  { key: 'subjects', label: 'Subjects', icon: IconBook, cls: 'i1', to: '/subjects', endpoint: '/subjects?limit=1', hint: 'Total subjects' },
  { key: 'classes', label: 'Classes', icon: IconUsers, cls: 'i2', to: '/classes', endpoint: '/classes?limit=1', hint: 'Active classes' },
];

const TEACHER_STATS: Stat[] = [
  { key: 'subjects', label: 'Subjects', icon: IconBook, cls: 'i1', to: '/subjects', endpoint: '/subjects?limit=1', hint: 'You teach' },
  { key: 'classes', label: 'Classes', icon: IconUsers, cls: 'i2', to: '/classes', endpoint: '/classes?limit=1', hint: 'Your classes' },
];

// quick links per role
const ADMIN_QUICK = [
  { to: '/users', label: 'Manage Users', icon: IconShield },
  { to: '/subjects', label: 'Subjects', icon: IconBook },
  { to: '/classes', label: 'Classes', icon: IconUsers },
  { to: '/posts', label: 'Posts', icon: IconChat },
];

const TEACHER_QUICK = [
  { to: '/materials', label: 'Add Material', icon: IconFolder },
  { to: '/quizzes', label: 'New Quiz', icon: IconQuiz },
  { to: '/tasks', label: 'New Task', icon: IconTask },
  { to: '/conferences', label: 'Conference', icon: IconVideo },
  { to: '/my-class', label: 'My Class', icon: IconUsers },
  { to: '/posts', label: 'Post', icon: IconChat },
];

const STUDENT_QUICK = [
  { to: '/materials', label: 'My Materials', icon: IconFolder },
  { to: '/quizzes', label: 'Take Quiz', icon: IconQuiz },
  { to: '/tasks', label: 'My Tasks', icon: IconTask },
  { to: '/conferences', label: 'Join Class', icon: IconVideo },
  { to: '/my-class', label: 'My Class', icon: IconUsers },
  { to: '/posts', label: 'Discussions', icon: IconChat },
];

export default function Dashboard() {
  const user = currentUser();
  const [counts, setCounts] = useState<Record<string, number | string>>({});

  const stats = user.role === 'admin' ? ADMIN_STATS : user.role === 'teacher' ? TEACHER_STATS : [];
  const quick = user.role === 'admin' ? ADMIN_QUICK : user.role === 'teacher' ? TEACHER_QUICK : STUDENT_QUICK;

  useEffect(() => {
    if (stats.length === 0) return;
    let active = true;
    (async () => {
      const result: Record<string, number | string> = {};
      await Promise.all(
        stats.map(async (s) => {
          try {
            const data = await apiGet(s.endpoint);
            result[s.key] = typeof data?.count === 'number' ? data.count : '—';
          } catch {
            result[s.key] = '—';
          }
        })
      );
      if (active) setCounts(result);
    })();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const roleBlurb =
    user.role === 'admin'
      ? 'Manage users, subjects, classes and the entire learning platform.'
      : user.role === 'teacher'
      ? 'Create materials, quizzes and tasks, and run live classes for your students.'
      : 'Access your class materials, take quizzes, submit tasks and join live sessions.';

  return (
    <div className="page">
      <div className="hero">
        <p className="hero-eyebrow">{greeting} 👋</p>
        <h2>Welcome back, {user.name}</h2>
        <p>{roleBlurb}</p>
        <div className="hero-tags">
          <span className="hero-tag">{user.role}</span>
          {user.className && <span className="hero-tag">{user.className}</span>}
          {user.programStudiName && <span className="hero-tag">{user.programStudiName}</span>}
          {user.universityName && <span className="hero-tag">{user.universityName}</span>}
        </div>
      </div>

      {/* Student identity card (university-style) */}
      {user.role === 'student' && (
        <div className="id-card">
          <div className="id-avatar">{user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()}</div>
          <div className="id-body">
            <div className="id-name">{user.name}</div>
            <div className="id-rows">
              <div><span>NIM</span><strong>{user.nim || '—'}</strong></div>
              <div><span>Class</span><strong>{user.className || '—'}</strong></div>
              <div><span>Programme</span><strong>{user.programStudiName || '—'}</strong></div>
              <div><span>University</span><strong>{user.universityName || '—'}</strong></div>
            </div>
          </div>
          <div className="id-stamp">STUDENT</div>
        </div>
      )}

      {stats.length > 0 && (
        <div className="stats-grid">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Link to={s.to} key={s.key} className="stat-card">
                <div className="stat-top">
                  <div className={`stat-icon ${s.cls}`}><Icon size={22} /></div>
                  <span className="stat-arrow">→</span>
                </div>
                <div>
                  <div className="stat-value">{counts[s.key] ?? '…'}</div>
                  <h3>{s.label}</h3>
                  <p className="stat-hint">{s.hint}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="panel">
        <h3>{user.role === 'student' ? 'For you' : 'Quick actions'}</h3>
        <div className="quick-grid">
          {quick.map((q) => {
            const Icon = q.icon;
            return (
              <Link to={q.to} key={q.to} className="quick-link">
                <Icon size={18} />
                <span>{q.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* capability hint footer */}
      {!can.manageSubjects() && (
        <p className="role-note">
          You're viewing Edura as a <strong>student</strong>. Some management features are only available to teachers and admins.
        </p>
      )}
    </div>
  );
}
