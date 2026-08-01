import { useState, useEffect } from 'react';
import { getProducts, getCategories, getSubCategories } from '../services/api';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {});
  }, []);

  // When category changes, load its subcategories and reset subcategory filter
  useEffect(() => {
    setSelectedSubCategory('');
    if (selectedCategory) {
      getSubCategories(selectedCategory).then(setSubCategories).catch(() => setSubCategories([]));
    } else {
      setSubCategories([]);
    }
  }, [selectedCategory]);

  // Reload products when category or subcategory filter changes
  useEffect(() => {
    setLoading(true);
    setError('');
    getProducts(selectedCategory, selectedSubCategory)
      .then(setProducts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedCategory, selectedSubCategory]);

  const categoryMap = Object.fromEntries(categories.map((c) => [c._id, c.name]));

  const handleCategorySelect = (id) => {
    setSelectedCategory(id);
  };

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
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          <button
            onClick={() => handleCategorySelect('')}
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
              onClick={() => handleCategorySelect(c._id)}
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

      {/* Subcategory filter — only shown when a category is selected and has subcategories */}
      {selectedCategory && subCategories.length > 0 && (
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-rose-400 font-semibold mb-3">Refine by subcategory</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedSubCategory('')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                selectedSubCategory === ''
                  ? 'bg-pink-400 text-white border-pink-400'
                  : 'bg-white text-pink-500 border-pink-200 hover:border-pink-400'
              }`}
            >
              All {categoryMap[selectedCategory]}
            </button>
            {subCategories.map((s) => (
              <button
                key={s._id}
                onClick={() => setSelectedSubCategory(s.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  selectedSubCategory === s.name
                    ? 'bg-pink-400 text-white border-pink-400'
                    : 'bg-white text-pink-500 border-pink-200 hover:border-pink-400'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
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
