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

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('university_id');
  localStorage.removeItem('program_studi_id');
  localStorage.removeItem('user_name');
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_role');
  window.location.href = '/';
}
