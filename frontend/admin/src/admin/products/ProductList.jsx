import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, AuthError } from '../api';
import ProductForm from './ProductForm';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const [prodData, catData] = await Promise.all([getProducts(), getCategories()]);
      setProducts(prodData);
      setCategories(catData);
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

  const categoryName = (id) => categories.find((c) => c._id === id)?.name || '—';

  const handleSubmit = async (form) => {
    try {
      if (editing && editing._id) {
        await updateProduct(editing._id, form);
      } else {
        await createProduct(form);
      }
      setEditing(null);
      await load();
    } catch (err) {
      if (err instanceof AuthError) navigate('/admin/login');
      else setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await deleteProduct(id);
      await load();
    } catch (err) {
      if (err instanceof AuthError) navigate('/admin/login');
      else setError(err.message);
    }
  };

  return (
    <div className="product-list">
      <div className="header-actions">
        <h2>Products</h2>
        {!editing && products.length > 0 && categories.length > 0 && (
          <button className="btn-primary" onClick={() => setEditing({})}>
            + Add Product
          </button>
        )}
      </div>

      {error && <p className="error">{error}</p>}

      {editing && (
        <div className="form-container">
          <h3>{editing._id ? 'Edit Product' : 'Create New Product'}</h3>
          <ProductForm
            initialData={editing._id ? editing : null}
            categories={categories}
            onSubmit={handleSubmit}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      {loading ? (
        <div className="loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">🌸</span>
          <h3>No products yet</h3>
          <p>Create your first product to showcase your beautiful flowers</p>
          {categories.length === 0 ? (
            <p style={{ color: 'var(--warning)', fontSize: '14px', marginTop: '16px' }}>
              ⚠️ Create a category first before adding products
            </p>
          ) : (
            <button className="btn-primary" onClick={() => setEditing({})}>
              Create Your First Product
            </button>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Featured</th>
                <th style={{ width: '150px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td><strong>{p.name}</strong></td>
                  <td>{categoryName(p.categoryId)}</td>
                  <td>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: p.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                      color: p.status === 'active' ? 'var(--success)' : 'var(--text)',
                      fontSize: '12px',
                      fontWeight: '500'
                    }}>
                      {p.status}
                    </span>
                  </td>
                  <td>{p.featured ? '⭐ Yes' : 'No'}</td>
                  <td>
                    <button className="btn-secondary btn-small" onClick={() => setEditing(p)}>Edit</button>
                    <button className="btn-danger btn-small" onClick={() => handleDelete(p._id)}>Delete</button>
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
