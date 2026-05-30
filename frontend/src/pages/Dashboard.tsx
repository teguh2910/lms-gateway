export default function Dashboard() {
  const name = localStorage.getItem('user_name') || 'User';
  const role = localStorage.getItem('user_role') || 'student';

  return (
    <div className="page">
      <h1>Dashboard</h1>
      <div className="welcome-card">
        <h2>Welcome, {name}!</h2>
        <p>Role: <strong>{role}</strong></p>
      </div>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Subjects</h3>
          <p>Manage course subjects</p>
        </div>
        <div className="stat-card">
          <h3>Classes</h3>
          <p>View and manage classes</p>
        </div>
        <div className="stat-card">
          <h3>Conferences</h3>
          <p>Online meetings</p>
        </div>
        <div className="stat-card">
          <h3>Materials</h3>
          <p>Course materials</p>
        </div>
        <div className="stat-card">
          <h3>Quizzes</h3>
          <p>Assessments</p>
        </div>
        <div className="stat-card">
          <h3>Tasks</h3>
          <p>Assignments</p>
        </div>
      </div>
    </div>
  );
}
