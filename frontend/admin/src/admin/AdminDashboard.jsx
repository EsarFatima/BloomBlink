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
      <header>
        <div>
          <h1>🌸 Bloom & Blink Admin</h1>
        </div>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <nav className="admin-tabs">
        <button
          className={tab === 'categories' ? 'active' : ''}
          onClick={() => setTab('categories')}
        >
          📁 Categories
        </button>
        <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>
          🌸 Products
        </button>
      </nav>

      <main>
        {tab === 'categories' && <CategoryList />}
        {tab === 'products' && <ProductList />}
      </main>
    </div>
  );
}
