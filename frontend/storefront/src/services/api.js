const API_ORIGIN = (import.meta.env.VITE_API_ORIGIN || '').replace(/\/$/, '');
const BASE = `${API_ORIGIN}/api`;

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export const getCategories = () => get('/categories');

export const getSubCategories = (categoryId) =>
  get(categoryId ? `/subcategories?categoryId=${categoryId}` : '/subcategories');

export const getProducts = (categoryId, subCategory) => {
  const params = new URLSearchParams();
  if (categoryId) params.set('categoryId', categoryId);
  if (subCategory) params.set('subCategory', subCategory);
  const qs = params.toString();
  return get(qs ? `/products?${qs}` : '/products');
};

export const getSiteContent = () => get('/site-content');

export const getContact = () => get('/contact');
