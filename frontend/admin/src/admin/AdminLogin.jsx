import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('bloomBlinkAdminToken', data.token);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <header className="login-topbar">
        <a className="admin-brand" href="/admin/login" aria-label="Bloom and Blink admin home">
          <span className="admin-brand-mark" aria-hidden="true">B</span>
          <span>
            <strong>Bloom & Blink</strong>
            <small>by Ramsha</small>
          </span>
        </a>
        <span className="secure-label">Private admin access</span>
      </header>

      <div className="login-shell">
        <section className="login-intro">
          <span className="eyebrow">Storefront control room</span>
          <h1>Keep every bloom beautifully organised.</h1>
          <p>
            Sign in to manage product collections, update listings, and keep the Bloom & Blink
            storefront ready for every celebration.
          </p>

          <div className="login-features">
            <article>
              <span aria-hidden="true">01</span>
              <div>
                <strong>Curate collections</strong>
                <p>Group bouquets and gifts into clear, elegant categories.</p>
              </div>
            </article>
            <article>
              <span aria-hidden="true">02</span>
              <div>
                <strong>Manage products</strong>
                <p>Add new arrangements and keep availability up to date.</p>
              </div>
            </article>
          </div>
        </section>

        <section className="login-panel">
          <div>
            <span className="panel-kicker">Welcome back</span>
            <h2>Admin sign in</h2>
            <p>Enter your authorised account details to continue.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@bloomblink.com"
                autoComplete="username"
                required
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
              />
            </label>
            {error && <p className="error">{error}</p>}
            <button className="btn-primary login-submit" type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in to dashboard'}
            </button>
          </form>

          <p className="login-note">Access is limited to authorised Bloom & Blink team members.</p>
        </section>
      </div>
    </main>
  );
}
