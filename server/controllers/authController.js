// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const db     = require('../config/db');

/** Generate a signed JWT for a user */
const signToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

// ─── POST /api/auth/register ─────────────────────────────────
exports.register = async (req, res) => {
  const { name, email, password, role = 'buyer', shop_name } = req.body;

  try {
    // Duplicate email check
    const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    // Hash password (cost factor 12)
    const hashed = await bcrypt.hash(password, 12);

    // Buyers are auto-approved; sellers need admin approval
    const is_approved = role === 'buyer' ? 1 : 0;

    const [result] = await db.execute(
      'INSERT INTO users (name, email, password, role, is_approved) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashed, role, is_approved]
    );

    const userId = result.insertId;

    // Create seller profile if registering as seller
    if (role === 'seller' && shop_name) {
      await db.execute(
        'INSERT INTO seller_profiles (user_id, shop_name) VALUES (?, ?)',
        [userId, shop_name]
      );
    }

    const newUser = { id: userId, name, email, role, is_approved };
    const token   = signToken(newUser);

    return res.status(201).json({
      success: true,
      message: role === 'seller'
        ? 'Seller account created. Awaiting admin approval.'
        : 'Account created successfully.',
      token,
      user: { id: userId, name, email, role, is_approved },
    });
  } catch (err) {
    console.error('register error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── POST /api/auth/login ────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.execute(
      'SELECT id, name, email, password, role, is_approved, is_active, avatar FROM users WHERE email = ?',
      [email]
    );

    if (!rows.length) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = signToken(user);

    // Don't send password back
    delete user.password;

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user,
    });
  } catch (err) {
    console.error('login error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── GET /api/auth/me ────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT u.id, u.name, u.email, u.role, u.is_approved, u.avatar, u.phone, u.created_at,
              sp.shop_name, sp.shop_logo, sp.shop_desc, sp.rating AS shop_rating
       FROM users u
       LEFT JOIN seller_profiles sp ON sp.user_id = u.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error('getMe error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── PUT /api/auth/profile ───────────────────────────────────
exports.updateProfile = async (req, res) => {
  const { name, phone, shop_name, shop_desc } = req.body;
  const avatar = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    const updates  = [];
    const params   = [];

    if (name)   { updates.push('name = ?');   params.push(name);  }
    if (phone)  { updates.push('phone = ?');  params.push(phone); }
    if (avatar) { updates.push('avatar = ?'); params.push(avatar);}

    if (updates.length) {
      params.push(req.user.id);
      await db.execute(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    }

    if (req.user.role === 'seller' && (shop_name || shop_desc)) {
      await db.execute(
        'UPDATE seller_profiles SET shop_name = COALESCE(?, shop_name), shop_desc = COALESCE(?, shop_desc) WHERE user_id = ?',
        [shop_name || null, shop_desc || null, req.user.id]
      );
    }

    return res.json({ success: true, message: 'Profile updated' });
  } catch (err) {
    console.error('updateProfile error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
