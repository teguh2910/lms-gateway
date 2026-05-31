const BASE_URL = '/api';

function getHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const userId = localStorage.getItem('user_id');
  const universityId = localStorage.getItem('university_id');
  const programStudiId = localStorage.getItem('program_studi_id');

  if (userId) headers['X-User-Id'] = userId;
  if (universityId) headers['X-University-Id'] = universityId;
  if (programStudiId) headers['X-Program-Studi-Id'] = programStudiId;

  return headers;
}

export async function apiGet(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: getHeaders() });
  return res.json();
}

export async function apiPost(path: string, body?: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: getHeaders(),
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

export async function apiPut(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function apiDelete(path: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return res.json();
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem('token');
}

export type Role = 'admin' | 'teacher' | 'student';

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  universityId: string;
  universityName: string;
  programStudiId: string;
  programStudiName: string;
  classId: string;
  className: string;
  nim: string;
}

export function currentUser(): CurrentUser {
  return {
    id: localStorage.getItem('user_id') || '',
    name: localStorage.getItem('user_name') || 'User',
    email: localStorage.getItem('user_email') || '',
    role: (localStorage.getItem('user_role') as Role) || 'student',
    universityId: localStorage.getItem('university_id') || '',
    universityName: localStorage.getItem('university_name') || '',
    programStudiId: localStorage.getItem('program_studi_id') || '',
    programStudiName: localStorage.getItem('program_studi_name') || '',
    classId: localStorage.getItem('class_id') || '',
    className: localStorage.getItem('class_name') || '',
    nim: localStorage.getItem('nim') || '',
  };
}

export function getRole(): Role {
  return (localStorage.getItem('user_role') as Role) || 'student';
}

// Capability flags per role
export const can = {
  manageUsers: (r: Role = getRole()) => r === 'admin',
  manageSubjects: (r: Role = getRole()) => r === 'admin' || r === 'teacher',
  manageClasses: (r: Role = getRole()) => r === 'admin' || r === 'teacher',
  manageConferences: (r: Role = getRole()) => r === 'admin' || r === 'teacher',
  manageMaterials: (r: Role = getRole()) => r === 'admin' || r === 'teacher',
  manageQuizzes: (r: Role = getRole()) => r === 'admin' || r === 'teacher',
  manageTasks: (r: Role = getRole()) => r === 'admin' || r === 'teacher',
  managePosts: (r: Role = getRole()) => r === 'admin' || r === 'teacher',
  gradeTasks: (r: Role = getRole()) => r === 'admin' || r === 'teacher',
  // students can take quizzes, submit tasks, join conferences, comment, download
  takeQuiz: (r: Role = getRole()) => r === 'student',
  submitTask: (r: Role = getRole()) => r === 'student',
  // every authenticated user that belongs to a class can view its roster
  viewClassmates: () => !!localStorage.getItem('class_id'),
};

export function logout() {
  localStorage.clear();
  window.location.href = '/';
}

