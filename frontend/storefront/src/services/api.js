const BASE = '/api';

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export const getProducts = (categoryId) =>
  get(categoryId ? `/products?categoryId=${categoryId}` : '/products');

export const getCategories = () => get('/categories');

export const getSiteContent = () => get('/site-content');

export const getContact = () => get('/contact');
