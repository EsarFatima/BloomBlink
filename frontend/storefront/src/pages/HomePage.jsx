import { useState, useEffect } from 'react';
import { getProducts, getCategories } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setError('');
    getProducts(selectedCategory)
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const categoryMap = Object.fromEntries(categories.map((c) => [c._id, c.name]));

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-rose-700 mb-3">Fresh Flowers, Delivered with Love 🌷</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Handpicked blooms for every occasion. Browse our collection below.
        </p>
      </div>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
              selectedCategory === ''
                ? 'bg-rose-500 text-white border-rose-500'
                : 'bg-white text-rose-600 border-rose-200 hover:border-rose-400'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c._id}
              onClick={() => setSelectedCategory(c._id)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                selectedCategory === c._id
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-white text-rose-600 border-rose-200 hover:border-rose-400'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* States */}
      {error && (
        <div className="text-center py-10 text-red-500 bg-red-50 rounded-xl border border-red-100">
          ⚠️ {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-rose-200 border-t-rose-500 rounded-full animate-spin" />
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🌸</div>
          <p className="text-lg">No products available yet. Check back soon!</p>
        </div>
      )}

      {/* Product grid */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} categoryName={categoryMap[p.categoryId]} />
          ))}
        </div>
      )}
    </div>
  );
}
