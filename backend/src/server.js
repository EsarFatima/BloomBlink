const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { getDb, closeDb } = require('./db');
const publicRoutes = require('./routes/public');
const adminRoutes = require('./routes/admin');

dotenv.config();

const app = express();
const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').map((origin) => origin.trim()).filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
}));
app.use(express.json());

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET is not set. Admin login will not work until it is configured.');
}

app.use('/api', publicRoutes);
app.use('/api/admin', adminRoutes);

app.use((error, req, res, next) => {
  res.status(500).json({
    message: error.message || 'Internal server error',
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Backend listening on port ${port}`);
});

process.on('SIGINT', async () => {
  await closeDb();
  process.exit(0);
});
