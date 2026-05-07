// controllers/adminController.js
const db = require('../config/db');

// ─── GET /api/admin/stats ─────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const [[userStats]]    = await db.execute(`
      SELECT
        COUNT(*) AS total_users,
        SUM(role = 'buyer')  AS buyers,
        SUM(role = 'seller') AS sellers,
        SUM(role = 'seller' AND is_approved = 0) AS pending_sellers
      FROM users WHERE role != 'admin'
    `);

    const [[orderStats]] = await db.execute(`
      SELECT
        COUNT(*)                        AS total_orders,
        SUM(status = 'delivered')       AS delivered,
        SUM(status = 'pending')         AS pending,
        SUM(total_amount)               AS total_revenue,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) AS today_orders
      FROM orders
    `);

    const [[productStats]] = await db.execute(`
      SELECT COUNT(*) AS total_products, SUM(stock = 0) AS out_of_stock
      FROM products WHERE is_active = 1
    `);

    // Revenue last 7 days
    const [revenueChart] = await db.execute(`
      SELECT DATE(created_at) AS date, SUM(total_amount) AS revenue, COUNT(*) AS orders
      FROM orders
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `);

    return res.json({
      success: true,
      data: { userStats, orderStats, productStats, revenueChart },
    });
  } catch (err) {
    console.error('getDashboardStats error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── GET /api/admin/users ─────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where  = ['u.role != "admin"'];
    const params = [];

    if (role)   { where.push('u.role = ?');           params.push(role); }
    if (search) { where.push('(u.name LIKE ? OR u.email LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

    const [rows] = await db.execute(
      `SELECT u.id, u.name, u.email, u.role, u.is_approved, u.is_active,
              u.created_at, sp.shop_name, sp.rating AS shop_rating
       FROM users u
       LEFT JOIN seller_profiles sp ON sp.user_id = u.id
       WHERE ${where.join(' AND ')}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getUsers error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── PUT /api/admin/users/:id/approve ────────────────────────
exports.approveSeller = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved } = req.body; // true or false

    await db.execute(
      'UPDATE users SET is_approved = ? WHERE id = ? AND role = "seller"',
      [approved ? 1 : 0, id]
    );

    return res.json({
      success: true,
      message: approved ? 'Seller approved' : 'Seller rejected',
    });
  } catch (err) {
    console.error('approveSeller error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── PUT /api/admin/users/:id/toggle ─────────────────────────
exports.toggleUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute(
      'UPDATE users SET is_active = NOT is_active WHERE id = ?', [id]
    );
    return res.json({ success: true, message: 'User status toggled' });
  } catch (err) {
    console.error('toggleUser error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── DELETE /api/admin/users/:id ─────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute('DELETE FROM users WHERE id = ? AND role != "admin"', [id]);
    return res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    console.error('deleteUser error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── GET /api/admin/orders ────────────────────────────────────
exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where  = [];
    const params = [];

    if (status) { where.push('o.status = ?'); params.push(status); }

    const whereStr = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [orders] = await db.execute(
      `SELECT o.id, o.status, o.total_amount, o.payment_status, o.payment_method,
              o.created_at, o.shipping_name, o.shipping_city,
              u.name AS buyer_name, u.email AS buyer_email,
              COUNT(oi.id) AS item_count
       FROM orders o
       JOIN users u ON u.id = o.buyer_id
       JOIN order_items oi ON oi.order_id = o.id
       ${whereStr}
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    return res.json({ success: true, data: orders });
  } catch (err) {
    console.error('getAllOrders error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── GET /api/admin/products ──────────────────────────────────
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where  = [];
    const params = [];

    if (search) { where.push('p.name LIKE ?'); params.push(`%${search}%`); }

    const whereStr = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await db.execute(
      `SELECT p.id, p.name, p.price, p.stock, p.is_active, p.is_featured,
              p.rating, p.sales_count, p.created_at,
              c.name AS category_name, u.name AS seller_name, sp.shop_name,
              (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS image
       FROM products p
       JOIN users u       ON u.id = p.seller_id
       JOIN categories c  ON c.id = p.category_id
       LEFT JOIN seller_profiles sp ON sp.user_id = p.seller_id
       ${whereStr}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getAllProducts error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
