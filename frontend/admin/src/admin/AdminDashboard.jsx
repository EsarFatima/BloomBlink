import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryList from './categories/CategoryList';
import ProductList from './products/ProductList';

export default function AdminDashboard() {
  const [tab, setTab] = useState('categories');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('bloomBlinkAdminToken');
    navigate('/admin/login');
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <a className="admin-brand" href="/admin/dashboard" aria-label="Bloom and Blink dashboard">
          <span className="admin-brand-mark" aria-hidden="true">B</span>
          <span>
            <strong>Bloom & Blink</strong>
            <small>Store manager</small>
          </span>
        </a>

        <div className="dashboard-heading">
          <span className="eyebrow">Admin workspace</span>
          <h1>Storefront dashboard</h1>
        </div>

        <button className="logout-button" type="button" onClick={handleLogout}>
          Sign out
        </button>
      </header>

      <nav className="admin-tabs" aria-label="Store management">
        <button
          type="button"
          className={tab === 'categories' ? 'active' : ''}
          onClick={() => setTab('categories')}
        >
          <span aria-hidden="true">⊞</span>
          Categories
        </button>
        <button
          type="button"
          className={tab === 'products' ? 'active' : ''}
          onClick={() => setTab('products')}
        >
          <span aria-hidden="true">✦</span>
          Products
        </button>
      </nav>

      <main>
        <div className="dashboard-intro">
          <div>
            <span className="panel-kicker">
              {tab === 'categories' ? 'Collection structure' : 'Product catalogue'}
            </span>
            <h2>{tab === 'categories' ? 'Manage categories' : 'Manage products'}</h2>
          </div>
          <p>
            {tab === 'categories'
              ? 'Create clear groups that help customers discover the right flowers and gifts.'
              : 'Keep every arrangement, status, and featured selection accurate.'}
          </p>
        </div>

        <section className="management-panel">
          {tab === 'categories' && <CategoryList />}
          {tab === 'products' && <ProductList />}
        </section>
      </main>
    </div>
  );
}
