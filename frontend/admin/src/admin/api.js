const BASE_URL = '/api/admin';

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


