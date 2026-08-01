const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { getDb, closeDb } = require('../src/db');

// Load environment variables first so modules that read `process.env` at
// require-time (serverless entry points, optional upload tooling, etc.) see
// the correct configuration. This ensures admin routes that depend on env
// values won't fail to load during project startup.
dotenv.config();

const publicRoutes = require('../src/routes/public');
let adminRoutes;
try {
  // load admin routes lazily — failures here should not break public health checks
  // (admin endpoints require more env/config like JWT_SECRET and optional upload tooling)
  // require may throw in some serverless contexts; catch to avoid function crash.
  // eslint-disable-next-line global-require
  adminRoutes = require('../src/routes/admin');
} catch (err) {
  // swallow — admin routes won't be mounted if loading fails
  // eslint-disable-next-line no-console
  console.warn('Admin routes failed to load:', err && err.message);
}

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map((origin) => origin.trim()).filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || origin === 'null') {
      return callback(null, true);
    }

    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
// lightweight health route that doesn't require DB (helps smoke checks)
app.get('/api/health', (req, res) => res.json({ ok: true, timestamp: Date.now() }));
app.use('/api', publicRoutes);
if (adminRoutes) app.use('/api/admin', adminRoutes);

app.use((error, req, res, next) => {
  res.status(500).json({ message: error.message || 'Internal server error' });
});

module.exports = app;
