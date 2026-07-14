import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  AuthError,
} from '../api';
import CategoryForm from './CategoryForm';

export default function CategoryList() {
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
      setError('');
    } catch (err) {
      if (err instanceof AuthError) navigate('/admin/login');
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (form) => {
    try {
      if (editing && editing._id) {
        await updateCategory(editing._id, form);
      } else {
        await createCategory(form);
      }
      setEditing(null);
      await load();
    } catch (err) {
      if (err instanceof AuthError) navigate('/admin/login');
      else setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await deleteCategory(id);
      await load();
    } catch (err) {
      if (err instanceof AuthError) navigate('/admin/login');
      else setError(err.message);
    }
  };

  return (
    <div className="category-list">
      <div className="header-actions">
        <h2>Categories</h2>
        {!editing && categories.length > 0 && (
          <button className="btn-primary" onClick={() => setEditing({})}>
            + Add Category
          </button>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      {editing && (
        <div className="form-container">
          <h3>{editing._id ? 'Edit Category' : 'Create New Category'}</h3>
          <CategoryForm 
            initialData={editing._id ? editing : null} 
            onSubmit={handleSubmit} 
            onCancel={() => setEditing(null)} 
          />
        </div>
      )}

      {loading ? (
        <div className="loading">Loading categories...</div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">📁</span>
          <h3>No categories yet</h3>
          <p>Create your first category to get started organizing your products</p>
          <button className="btn-primary" onClick={() => setEditing({})}>
            Create Your First Category
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th style={{ width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td><strong>{c.name}</strong></td>
                  <td><code>{c.slug}</code></td>
                  <td>{c.description || '—'}</td>
                  <td>
                    <button className="btn-secondary btn-small" onClick={() => setEditing(c)}>Edit</button>
                    <button className="btn-danger btn-small" onClick={() => handleDelete(c._id)}>Delete</button>
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
