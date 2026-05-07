// app.js — Pet Marketplace API Server
require('dotenv').config();

const express     = require('express');
const cors        = require('cors');
const helmet      = require('helmet');
const morgan      = require('morgan');
const path        = require('path');
const rateLimit   = require('express-rate-limit');
const db          = require('./config/db');

const bcrypt = require('bcryptjs');
const app = express();

// ─── Security & Middleware ────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files as static assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Rate Limiting ────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later' },
});

app.use('/api/', apiLimiter);

// ─── Routes ───────────────────────────────────────────────────
const authRoutes    = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes   = require('./routes/orders');
const { cartRouter, adminRouter } = require('./routes/cartAdmin');

app.use('/api/auth',     authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders',   orderRoutes);
app.use('/api/cart',     cartRouter);
app.use('/api/admin',    adminRouter);

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
);

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` })
);

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err.message?.includes('image')) {
    return res.status(400).json({ success: false, message: err.message });
  }
  return res.status(500).json({ success: false, message: 'Internal server error' });
});

// ─── Default Admin Setup ──────────────────────────────────────
const DEFAULT_ADMIN_EMAIL    = 'admin@petmarket.com';
const DEFAULT_ADMIN_NAME     = 'Admin';
const DEFAULT_ADMIN_PASSWORD = 'Admin@123';

const ensureDefaultAdmin = async () => {
  try {
    const [rows] = await db.execute(
      'SELECT id, password, role FROM users WHERE email = ?',
      [DEFAULT_ADMIN_EMAIL]
    );

    if (!rows.length) {
      const hashed = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);
      await db.execute(
        'INSERT INTO users (name, email, password, role, is_approved, is_active) VALUES (?, ?, ?, ?, 1, 1)',
        [DEFAULT_ADMIN_NAME, DEFAULT_ADMIN_EMAIL, hashed, 'admin']
      );
      console.log(`✅ Default admin account created: ${DEFAULT_ADMIN_EMAIL}`);
      return;
    }

    const admin = rows[0];
    if (admin.role !== 'admin') {
      console.warn(`⚠️ User ${DEFAULT_ADMIN_EMAIL} exists but is not an admin. Please fix this account manually.`);
      return;
    }

    const valid = await bcrypt.compare(DEFAULT_ADMIN_PASSWORD, admin.password);
    if (!valid) {
      const hashed = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);
      await db.execute('UPDATE users SET password = ?, is_approved = 1, is_active = 1 WHERE id = ?', [hashed, admin.id]);
      console.log(`✅ Default admin password reset for ${DEFAULT_ADMIN_EMAIL}`);
    }
  } catch (err) {
    console.error('ensureDefaultAdmin error:', err);
  }
};

// ─── Start ────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
(async () => {
  if (process.env.NODE_ENV !== 'production') {
    await ensureDefaultAdmin();
  }
  app.listen(PORT, () => {
    console.log(`🚀 Pet Marketplace API running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})();

module.exports = app;
