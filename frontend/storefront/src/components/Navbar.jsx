import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();

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
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🌸</span>
          <span className="text-xl font-bold text-rose-600 tracking-tight">Bloom & Blink</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-6">
          {link('/', 'Shop')}
          {link('/about', 'About Us')}
          {link('/contact', 'Contact')}

          {/* Admin icon */}
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
      </div>
    </nav>
  );
}
