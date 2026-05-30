import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '../api';
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
  field: string;
  hint: string;
}

const STATS: Stat[] = [
  { key: 'subjects', label: 'Subjects', icon: IconBook, cls: 'i1', to: '/subjects', endpoint: '/subjects?limit=1', field: 'subjects', hint: 'Total subjects' },
  { key: 'classes', label: 'Classes', icon: IconUsers, cls: 'i2', to: '/classes', endpoint: '/classes?limit=1', field: 'classes', hint: 'Active classes' },
  { key: 'users', label: 'Users', icon: IconShield, cls: 'i4', to: '/users', endpoint: '/users?limit=1', field: 'users', hint: 'Registered users' },
];

const QUICK = [
  { to: '/subjects', label: 'New Subject', icon: IconBook },
  { to: '/classes', label: 'New Class', icon: IconUsers },
  { to: '/conferences', label: 'Conference', icon: IconVideo },
  { to: '/materials', label: 'Materials', icon: IconFolder },
  { to: '/quizzes', label: 'Quizzes', icon: IconQuiz },
  { to: '/tasks', label: 'Tasks', icon: IconTask },
  { to: '/posts', label: 'Posts', icon: IconChat },
  { to: '/users', label: 'Users', icon: IconShield },
];

export default function Dashboard() {
  const name = localStorage.getItem('user_name') || 'User';
  const role = localStorage.getItem('user_role') || 'student';
  const [counts, setCounts] = useState<Record<string, number | string>>({});

  useEffect(() => {
    let active = true;
    (async () => {
      const result: Record<string, number | string> = {};
      await Promise.all(
        STATS.map(async (s) => {
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
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="page">
      <div className="hero">
        <p className="hero-eyebrow">{greeting} 👋</p>
        <h2>Welcome back, {name}</h2>
        <p>
          You're signed in as <strong style={{ textTransform: 'capitalize' }}>{role}</strong>.
          Here's a quick overview of your learning workspace.
        </p>
      </div>

      <div className="stats-grid">
        {STATS.map((s) => {
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

      <div className="panel">
        <h3>Quick actions</h3>
        <div className="quick-grid">
          {QUICK.map((q) => {
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
    </div>
  );
}
