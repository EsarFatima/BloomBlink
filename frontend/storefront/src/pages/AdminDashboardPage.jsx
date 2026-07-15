import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = '/api/admin';

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('bloomBlinkAdminToken');
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (res.status === 401) throw new Error('SESSION_EXPIRED');
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// ── Category Management ──────────────────────────────────────────────────────

function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', slug: '', description: '', imageUrl: '' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try { setCategories(await apiFetch('/categories')); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (c) => { setEditing(c._id); setForm({ name: c.name, slug: c.slug, description: c.description || '', imageUrl: c.imageUrl || '' }); setError(''); };
  const cancelEdit = () => { setEditing(null); setForm({ name: '', slug: '', description: '', imageUrl: '' }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) await apiFetch(`/categories/${editing}`, { method: 'PUT', body: JSON.stringify(form) });
      else await apiFetch('/categories', { method: 'POST', body: JSON.stringify(form) });
      cancelEdit(); await load();
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try { await apiFetch(`/categories/${id}`, { method: 'DELETE' }); await load(); }
    catch (e) { setError(e.message); }
  };

  return (
    <div>
      {error && <p className="text-red-500 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">⚠️ {error}</p>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 bg-rose-50 p-4 rounded-xl">
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        <input placeholder="Slug (auto if empty)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="input" />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" />
        <input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="input" />
        <div className="sm:col-span-2 flex gap-2">
          <button type="submit" className="btn-primary">{editing ? 'Update' : '+ Add Category'}</button>
          {editing && <button type="button" onClick={cancelEdit} className="btn-secondary">Cancel</button>}
        </div>
      </form>
      {loading ? <p className="text-gray-400 text-sm">Loading...</p> : categories.length === 0 ? (
        <div className="text-center py-10 text-gray-400 border-2 border-dashed border-rose-100 rounded-xl">
          <p className="text-4xl mb-2">📁</p><p>No categories yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-rose-100">
          <table className="w-full text-sm">
            <thead className="bg-rose-50 text-rose-700"><tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Slug</th><th className="px-4 py-3 text-left">Description</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id} className="border-t border-rose-50 hover:bg-rose-50/50">
                  <td className="px-4 py-3 font-medium text-rose-900">{c.name}</td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-3 text-gray-500">{c.description || '—'}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => startEdit(c)} className="btn-sm-secondary">Edit</button>
                    <button onClick={() => handleDelete(c._id)} className="btn-sm-danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Product Management ───────────────────────────────────────────────────────

function ProductManager() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', categoryId: '', imageUrl: '', price: '', featured: false, status: 'active' });
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [p, c] = await Promise.all([apiFetch('/products'), apiFetch('/categories')]);
      setProducts(p); setCategories(c);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const catName = (id) => categories.find((c) => c._id === id)?.name || '—';
  const startEdit = (p) => {
    setEditing(p._id);
    setForm({ name: p.name, description: p.description || '', categoryId: p.categoryId || '', imageUrl: p.imageUrl || '', price: p.price ?? '', featured: p.featured || false, status: p.status || 'active' });
    setError('');
  };
  const cancelEdit = () => { setEditing(null); setForm({ name: '', description: '', categoryId: '', imageUrl: '', price: '', featured: false, status: 'active' }); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // price is fully optional — send null if empty
      const payload = { ...form, price: form.price !== '' ? Number(form.price) : null };
      if (editing) await apiFetch(`/products/${editing}`, { method: 'PUT', body: JSON.stringify(payload) });
      else await apiFetch('/products', { method: 'POST', body: JSON.stringify(payload) });
      cancelEdit(); await load();
    } catch (e) { setError(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try { await apiFetch(`/products/${id}`, { method: 'DELETE' }); await load(); }
    catch (e) { setError(e.message); }
  };

  return (
    <div>
      {error && <p className="text-red-500 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">⚠️ {error}</p>}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 bg-rose-50 p-4 rounded-xl">
        <input required placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
        <input placeholder="Price — leave empty to show 'Contact for pricing'" type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" />
        <textarea required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input sm:col-span-2 resize-none" rows={2} />
        <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="input">
          <option value="">Select Category</option>
          {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="input" />
        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="input">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} className="accent-rose-500" />
          Featured product
        </label>
        <div className="sm:col-span-2 flex gap-2">
          <button type="submit" className="btn-primary">{editing ? 'Update' : '+ Add Product'}</button>
          {editing && <button type="button" onClick={cancelEdit} className="btn-secondary">Cancel</button>}
        </div>
      </form>
      {loading ? <p className="text-gray-400 text-sm">Loading...</p> : products.length === 0 ? (
        <div className="text-center py-10 text-gray-400 border-2 border-dashed border-rose-100 rounded-xl">
          <p className="text-4xl mb-2">🌸</p><p>No products yet</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-rose-100">
          <table className="w-full text-sm">
            <thead className="bg-rose-50 text-rose-700"><tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Category</th><th className="px-4 py-3 text-left">Price</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-t border-rose-50 hover:bg-rose-50/50">
                  <td className="px-4 py-3 font-medium text-rose-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-500">{catName(p.categoryId)}</td>
                  <td className="px-4 py-3 text-gray-500">{p.price != null ? `$${p.price}` : <span className="text-xs text-rose-400 italic">Contact for pricing</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{p.status}</span>
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => startEdit(p)} className="btn-sm-secondary">Edit</button>
                    <button onClick={() => handleDelete(p._id)} className="btn-sm-danger">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Site Content Editor ──────────────────────────────────────────────────────

function SiteContentEditor() {
  const [form, setForm] = useState({
    aboutUs: '',
    contact: { phone: '', email: '', address: '' },
    whatsappNumber: '',
    whatsappShowQr: false,
    socialLinks: [],
  });
  const [newLink, setNewLink] = useState({ label: '', url: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/site-content')
      .then((data) => setForm({
        aboutUs: data.aboutUs || '',
        contact: { phone: data.contact?.phone || '', email: data.contact?.email || '', address: data.contact?.address || '' },
        whatsappNumber: data.whatsappNumber || '',
        whatsappShowQr: data.whatsappShowQr || false,
        socialLinks: Array.isArray(data.socialLinks) ? data.socialLinks : [],
      }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const addSocialLink = () => {
    if (!newLink.label.trim() || !newLink.url.trim()) return;
    setForm((f) => ({ ...f, socialLinks: [...f.socialLinks, { label: newLink.label.trim(), url: newLink.url.trim() }] }));
    setNewLink({ label: '', url: '' });
  };

  const removeSocialLink = (i) => {
    setForm((f) => ({ ...f, socialLinks: f.socialLinks.filter((_, idx) => idx !== i) }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await apiFetch('/site-content', { method: 'PUT', body: JSON.stringify(form) });
      setSuccess('Content saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {error && <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">⚠️ {error}</p>}
      {success && <p className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">✅ {success}</p>}

      {/* About Us */}
      <div>
        <h3 className="text-base font-semibold text-rose-700 mb-3">🌺 About Us Content</h3>
        <textarea
          value={form.aboutUs}
          onChange={(e) => setForm({ ...form, aboutUs: e.target.value })}
          rows={6}
          placeholder="Write your shop story here..."
          className="input w-full resize-none"
        />
      </div>

      {/* Contact info */}
      <div>
        <h3 className="text-base font-semibold text-rose-700 mb-3">📞 Contact Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input placeholder="Phone (e.g. +1 234 567 8900)" value={form.contact.phone} onChange={(e) => setForm({ ...form, contact: { ...form.contact, phone: e.target.value } })} className="input" />
          <input placeholder="Email" type="email" value={form.contact.email} onChange={(e) => setForm({ ...form, contact: { ...form.contact, email: e.target.value } })} className="input" />
          <input placeholder="Address" value={form.contact.address} onChange={(e) => setForm({ ...form, contact: { ...form.contact, address: e.target.value } })} className="input" />
        </div>
      </div>

      {/* WhatsApp */}
      <div>
        <h3 className="text-base font-semibold text-rose-700 mb-1">💬 WhatsApp</h3>
        <p className="text-xs text-gray-400 mb-3">Enter number with country code, no spaces or symbols (e.g. 923001234567)</p>
        <input
          placeholder="WhatsApp number (e.g. 923001234567)"
          value={form.whatsappNumber}
          onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value.replace(/\D/g, '') })}
          className="input max-w-xs"
        />
        {form.whatsappNumber && (
          <label className="flex items-center gap-2 mt-3 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={form.whatsappShowQr}
              onChange={(e) => setForm({ ...form, whatsappShowQr: e.target.checked })}
              className="accent-rose-500"
            />
            Also show QR code on Contact page
          </label>
        )}
      </div>

      {/* Social links */}
      <div>
        <h3 className="text-base font-semibold text-rose-700 mb-3">🔗 Social / Additional Links</h3>

        {/* Existing links */}
        {form.socialLinks.length > 0 && (
          <div className="space-y-2 mb-3">
            {form.socialLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2 bg-rose-50 px-3 py-2 rounded-lg">
                <span className="text-sm font-medium text-rose-800 w-32 truncate">{link.label}</span>
                <span className="text-xs text-gray-400 flex-1 truncate">{link.url}</span>
                <button
                  type="button"
                  onClick={() => removeSocialLink(i)}
                  className="text-red-400 hover:text-red-600 text-lg leading-none flex-shrink-0"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add new link */}
        <div className="flex gap-2 flex-wrap">
          <input
            placeholder="Label (e.g. Instagram)"
            value={newLink.label}
            onChange={(e) => setNewLink({ ...newLink, label: e.target.value })}
            className="input flex-1 min-w-32"
          />
          <input
            placeholder="URL (e.g. https://instagram.com/...)"
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            className="input flex-[2] min-w-48"
          />
          <button
            type="button"
            onClick={addSocialLink}
            disabled={!newLink.label.trim() || !newLink.url.trim()}
            className="btn-secondary disabled:opacity-40"
          >
            + Add
          </button>
        </div>
      </div>

      <button type="submit" disabled={saving} className="btn-primary">
        {saving ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'categories', label: '📁 Categories' },
  { id: 'products', label: '🌸 Products' },
  { id: 'content', label: '✏️ Site Content' },
];

export default function AdminDashboardPage() {
  const [tab, setTab] = useState('categories');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('bloomBlinkAdminToken');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-rose-50">
      <header className="bg-white border-b border-rose-100 shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          <span className="text-xl font-bold text-rose-700">Bloom & Blink Admin</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/" className="text-sm text-rose-400 hover:text-rose-600 transition-colors">← View Shop</a>
          <button onClick={handleLogout} className="btn-sm-danger">Logout</button>
        </div>
      </header>

      <nav className="bg-white border-b border-rose-100 px-6 flex gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
              tab === t.id ? 'border-rose-500 text-rose-600' : 'border-transparent text-gray-500 hover:text-rose-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-6 max-w-6xl mx-auto w-full">
        <style>{`
          .input { padding: 8px 12px; border: 1px solid #fecdd3; border-radius: 8px; font-size: 14px; background: white; width: 100%; outline: none; box-sizing: border-box; }
          .input:focus { border-color: #f43f5e; box-shadow: 0 0 0 3px rgba(244,63,94,0.1); }
          .btn-primary { background: #f43f5e; color: white; padding: 8px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; transition: opacity 0.2s; }
          .btn-primary:hover:not(:disabled) { opacity: 0.9; }
          .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
          .btn-secondary { background: white; color: #9f1239; padding: 8px 20px; border-radius: 8px; font-size: 14px; font-weight: 500; border: 1px solid #fecdd3; cursor: pointer; }
          .btn-secondary:hover:not(:disabled) { background: #fff1f2; }
          .btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }
          .btn-sm-secondary { background: white; color: #9f1239; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; border: 1px solid #fecdd3; cursor: pointer; }
          .btn-sm-secondary:hover { background: #fff1f2; }
          .btn-sm-danger { background: #fee2e2; color: #dc2626; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; border: none; cursor: pointer; }
          .btn-sm-danger:hover { background: #fecaca; }
        `}</style>

        <div className="bg-white rounded-2xl shadow-sm border border-rose-100 p-6">
          <h2 className="text-lg font-bold text-rose-800 mb-6">
            {TABS.find((t) => t.id === tab)?.label}
          </h2>
          {tab === 'categories' && <CategoryManager />}
          {tab === 'products' && <ProductManager />}
          {tab === 'content' && <SiteContentEditor />}
        </div>
      </main>
    </div>
  );
}
