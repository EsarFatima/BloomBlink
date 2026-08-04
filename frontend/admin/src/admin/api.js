const API_BASE = (import.meta.env.VITE_API_URL || import.meta.env.VITE_API_ORIGIN || '').replace(/\/$/, '');
const BASE_URL = API_BASE ? `${API_BASE}/api/admin` : '/api/admin';

export class AuthError extends Error {}

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('bloomBlinkAdminToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('bloomBlinkAdminToken');
    throw new AuthError('Session expired');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export const getMe = () => apiFetch('/me');

export const getCategories = () => apiFetch('/categories');
export const createCategory = (data) =>
  apiFetch('/categories', { method: 'POST', body: JSON.stringify(data) });
export const updateCategory = (id, data) =>
  apiFetch(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteCategory = (id) => apiFetch(`/categories/${id}`, { method: 'DELETE' });

export const getProducts = () => apiFetch('/products');
export const createProduct = (data) =>
  apiFetch('/products', { method: 'POST', body: JSON.stringify(data) });
export const updateProduct = (id, data) =>
  apiFetch(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteProduct = (id) => apiFetch(`/products/${id}`, { method: 'DELETE' });

export const getContactInfo = () => apiFetch("/contact");
export const updateContactInfo = (data) => apiFetch("/contact", { method: "PUT", body: JSON.stringify(data) });

export async function uploadImage(file) {
  const token = localStorage.getItem('bloomBlinkAdminToken');
  const formData = new FormData();
  formData.append('image', file);

  const res = await fetch(`${BASE_URL}/upload-image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('bloomBlinkAdminToken');
    throw new Error('Session expired');
  }

  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || 'Image upload failed');
  return body.url;
}


