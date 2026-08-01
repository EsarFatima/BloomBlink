const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { getDb, closeDb } = require('../src/db');
const publicRoutes = require('../src/routes/public');
const adminRoutes = require('../src/routes/admin');

dotenv.config();

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
app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

app.use((error, req, res, next) => {
  res.status(500).json({ message: error.message || 'Internal server error' });
});

module.exports = app;
