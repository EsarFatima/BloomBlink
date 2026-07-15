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
          <button className="btn-primary" type="button" onClick={() => setEditing({})}>
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
          <span className="empty-state-icon" aria-hidden="true">✦</span>
          <h3>No products yet</h3>
          <p>Create your first product to showcase your beautiful flowers</p>
          {categories.length === 0 ? (
            <p className="empty-state-warning">
              Create a category first before adding products.
            </p>
          ) : (
            <button className="btn-primary" type="button" onClick={() => setEditing({})}>
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
                    <span className={`status-badge status-${p.status}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>{p.featured ? <span className="featured-badge">Featured</span> : 'No'}</td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-secondary btn-small" type="button" onClick={() => setEditing(p)}>Edit</button>
                      <button className="btn-danger btn-small" type="button" onClick={() => handleDelete(p._id)}>Delete</button>
                    </div>
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
