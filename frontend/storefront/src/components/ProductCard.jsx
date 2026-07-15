import { Link } from 'react-router-dom';

const PLACEHOLDER = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23fce7f3'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='64'%3E🌸%3C/text%3E%3C/svg%3E`;

export default function ProductCard({ product, categoryName }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-rose-100 overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-200">
      <div className="aspect-[4/3] overflow-hidden bg-rose-50">
        <img
          src={product.imageUrl || PLACEHOLDER}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => { e.target.onerror = null; e.target.src = PLACEHOLDER; }}
        />
      </div>
      <div className="p-4">
        {categoryName && (
          <span className="text-xs font-medium text-pink-500 bg-pink-50 px-2 py-0.5 rounded-full">
            {categoryName}
          </span>
        )}
        <h3 className="mt-2 font-semibold text-rose-900 text-base leading-tight">{product.name}</h3>
        {product.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
        )}
        <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
          {product.price != null && product.price !== '' ? (
            <span className="text-rose-600 font-bold text-lg">${product.price}</span>
          ) : (
            <Link
              to="/contact"
              className="text-xs font-medium text-white bg-rose-400 hover:bg-rose-500 px-3 py-1.5 rounded-full transition-colors"
            >
              Contact for pricing
            </Link>
          )}
          {product.featured && (
            <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-medium">
              ⭐ Featured
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
