import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const link = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors hover:text-pink-500 ${
        pathname === to ? 'text-pink-500' : 'text-rose-700'
      }`}
    >
      {label}
    </Link>
  );

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-rose-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <span className="text-2xl">🌸</span>
          <span className="text-xl font-bold text-rose-600 tracking-tight">Bloom & Blink</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {link('/', 'Shop')}
          {link('/about', 'About Us')}
          {link('/contact', 'Contact')}

          <Link
            to="/admin/login"
            title="Admin Login"
            className="text-rose-300 hover:text-rose-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden inline-flex items-center justify-center rounded-full border border-rose-200 p-2 text-rose-600"
          onClick={() => setMobileOpen((open) => !open)}
          aria-label="Toggle navigation"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="7" x2="20" y2="7" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="17" x2="20" y2="17" />
          </svg>
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-rose-100 bg-white px-4 py-3 space-y-2">
          <Link to="/" className={`block rounded-lg px-3 py-2 text-sm font-medium ${pathname === '/' ? 'bg-rose-50 text-pink-600' : 'text-rose-700'}`} onClick={() => setMobileOpen(false)}>
            Shop
          </Link>
          <Link to="/about" className={`block rounded-lg px-3 py-2 text-sm font-medium ${pathname === '/about' ? 'bg-rose-50 text-pink-600' : 'text-rose-700'}`} onClick={() => setMobileOpen(false)}>
            About Us
          </Link>
          <Link to="/contact" className={`block rounded-lg px-3 py-2 text-sm font-medium ${pathname === '/contact' ? 'bg-rose-50 text-pink-600' : 'text-rose-700'}`} onClick={() => setMobileOpen(false)}>
            Contact
          </Link>
          <Link to="/admin/login" className="block rounded-lg px-3 py-2 text-sm font-medium text-rose-700" onClick={() => setMobileOpen(false)}>
            Admin Login
          </Link>
        </div>
      )}
    </nav>
  );
}
