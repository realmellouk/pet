// controllers/cartController.js
const db = require('../config/db');

// ─── GET /api/cart ────────────────────────────────────────────
exports.getCart = async (req, res) => {
  try {
    const [items] = await db.execute(
      `SELECT ci.id, ci.quantity, ci.added_at,
              p.id AS product_id, p.name, p.price, p.compare_price, p.stock, p.slug,
              (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS image,
              sp.shop_name
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id AND p.is_active = 1
       LEFT JOIN seller_profiles sp ON sp.user_id = p.seller_id
       WHERE ci.user_id = ?`,
      [req.user.id]
    );

    const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return res.json({ success: true, data: { items, total: total.toFixed(2) } });
  } catch (err) {
    console.error('getCart error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── POST /api/cart ───────────────────────────────────────────
exports.addToCart = async (req, res) => {
  const { product_id, quantity = 1 } = req.body;

  try {
    // Check stock
    const [rows] = await db.execute(
      'SELECT stock FROM products WHERE id = ? AND is_active = 1', [product_id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (rows[0].stock < quantity) {
      return res.status(400).json({ success: false, message: 'Insufficient stock' });
    }

    // Upsert cart item
    await db.execute(
      `INSERT INTO cart_items (user_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [req.user.id, product_id, quantity]
    );

    return res.json({ success: true, message: 'Added to cart' });
  } catch (err) {
    console.error('addToCart error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── PUT /api/cart/:id ────────────────────────────────────────
exports.updateCartItem = async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;

  try {
    if (quantity <= 0) {
      await db.execute('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [id, req.user.id]);
    } else {
      await db.execute(
        'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
        [quantity, id, req.user.id]
      );
    }
    return res.json({ success: true, message: 'Cart updated' });
  } catch (err) {
    console.error('updateCartItem error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── DELETE /api/cart/:id ─────────────────────────────────────
exports.removeCartItem = async (req, res) => {
  try {
    await db.execute(
      'DELETE FROM cart_items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    return res.json({ success: true, message: 'Item removed' });
  } catch (err) {
    console.error('removeCartItem error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── DELETE /api/cart ─────────────────────────────────────────
exports.clearCart = async (req, res) => {
  try {
    await db.execute('DELETE FROM cart_items WHERE user_id = ?', [req.user.id]);
    return res.json({ success: true, message: 'Cart cleared' });
  } catch (err) {
    console.error('clearCart error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
