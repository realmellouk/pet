// controllers/orderController.js
const db = require('../config/db');

// ─── POST /api/orders ─────────────────────────── buyer ──────
exports.createOrder = async (req, res) => {
  const {
    items,               // [{ product_id, quantity }]
    shipping_name, shipping_phone, shipping_address, shipping_city, shipping_zip,
    payment_method = 'cod', notes,
  } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    let total_amount    = 0;
    const orderItems    = [];

    // Validate stock and calculate total
    for (const item of items) {
      const [rows] = await conn.execute(
        `SELECT p.id, p.name, p.price, p.stock, p.seller_id,
                (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS image
         FROM products p
         WHERE p.id = ? AND p.is_active = 1`,
        [item.product_id]
      );

      if (!rows.length) {
        throw { status: 404, message: `Product ${item.product_id} not found` };
      }

      const product = rows[0];
      if (product.stock < item.quantity) {
        throw { status: 400, message: `Insufficient stock for "${product.name}"` };
      }

      const line_total = parseFloat(product.price) * item.quantity;
      total_amount += line_total;

      orderItems.push({
        product_id:    product.id,
        seller_id:     product.seller_id,
        quantity:      item.quantity,
        unit_price:    product.price,
        total_price:   line_total,
        product_name:  product.name,
        product_image: product.image || null,
      });
    }

    const shipping_amount = total_amount > 500 ? 0 : 30; // Free shipping over 500

    // Create order
    const [orderResult] = await conn.execute(
      `INSERT INTO orders
         (buyer_id, total_amount, shipping_amount, payment_method,
          shipping_name, shipping_phone, shipping_address, shipping_city, shipping_zip, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, total_amount + shipping_amount, shipping_amount, payment_method,
       shipping_name, shipping_phone, shipping_address, shipping_city, shipping_zip || null, notes || null]
    );

    const orderId = orderResult.insertId;

    // Insert order items + decrement stock
    for (const item of orderItems) {
      await conn.execute(
        `INSERT INTO order_items
           (order_id, product_id, seller_id, quantity, unit_price, total_price, product_name, product_image)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.seller_id, item.quantity, item.unit_price,
         item.total_price, item.product_name, item.product_image]
      );

      await conn.execute(
        'UPDATE products SET stock = stock - ?, sales_count = sales_count + ? WHERE id = ?',
        [item.quantity, item.quantity, item.product_id]
      );
    }

    // Clear buyer's cart
    const productIds = items.map(i => i.product_id);
    if (productIds.length) {
      await conn.execute(
        `DELETE FROM cart_items WHERE user_id = ? AND product_id IN (${productIds.map(() => '?').join(',')})`,
        [req.user.id, ...productIds]
      );
    }

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: { order_id: orderId, total: total_amount + shipping_amount },
    });
  } catch (err) {
    await conn.rollback();
    if (err.status) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    console.error('createOrder error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  } finally {
    conn.release();
  }
};

// ─── GET /api/orders/user ─────────────────────────────────────
exports.getBuyerOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = ['o.buyer_id = ?'];
    const params = [req.user.id];

    if (status) { where.push('o.status = ?'); params.push(status); }

    const [orders] = await db.execute(
      `SELECT o.id, o.status, o.total_amount, o.shipping_amount,
              o.payment_method, o.payment_status, o.created_at,
              COUNT(oi.id) AS item_count
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       WHERE ${where.join(' AND ')}
       GROUP BY o.id
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    return res.json({ success: true, data: orders });
  } catch (err) {
    console.error('getBuyerOrders error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── GET /api/orders/:id ──────────────────────────────────────
exports.getOrderDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const [orders] = await db.execute(
      `SELECT o.*, u.name AS buyer_name, u.email AS buyer_email
       FROM orders o JOIN users u ON u.id = o.buyer_id
       WHERE o.id = ?`, [id]
    );
    if (!orders.length) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = orders[0];

    // Authorization: buyer sees own, seller sees own items, admin sees all
    if (req.user.role === 'buyer' && order.buyer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const [items] = await db.execute(
      `SELECT oi.*, sp.shop_name
       FROM order_items oi
       LEFT JOIN seller_profiles sp ON sp.user_id = oi.seller_id
       WHERE oi.order_id = ?`, [id]
    );

    return res.json({ success: true, data: { ...order, items } });
  } catch (err) {
    console.error('getOrderDetail error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── GET /api/orders/seller ───────────────────────────────────
exports.getSellerOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where = ['oi.seller_id = ?'];
    const params = [req.user.id];

    if (status) { where.push('oi.item_status = ?'); params.push(status); }

    const [items] = await db.execute(
      `SELECT oi.*, o.created_at AS order_date, o.payment_status,
              o.shipping_name, o.shipping_city,
              u.name AS buyer_name, u.email AS buyer_email
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       JOIN users u  ON u.id = o.buyer_id
       WHERE ${where.join(' AND ')}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    return res.json({ success: true, data: items });
  } catch (err) {
    console.error('getSellerOrders error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── PUT /api/orders/:id/status ───────────────────────────────
exports.updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    await db.execute('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    return res.json({ success: true, message: 'Order status updated' });
  } catch (err) {
    console.error('updateOrderStatus error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
