// controllers/productController.js
const db   = require('../config/db');
const path = require('path');
const fs   = require('fs');

// Helper: build image URL array from joined query
const buildProductImages = (rows) => {
  const map = new Map();
  rows.forEach(row => {
    if (!map.has(row.id)) {
      map.set(row.id, {
        id: row.id, seller_id: row.seller_id, category_id: row.category_id,
        name: row.name, slug: row.slug, description: row.description,
        price: row.price, compare_price: row.compare_price, stock: row.stock,
        brand: row.brand, pet_type: row.pet_type, rating: row.rating,
        review_count: row.review_count, sales_count: row.sales_count,
        is_featured: row.is_featured, category_name: row.category_name,
        seller_name: row.seller_name, shop_name: row.shop_name,
        created_at: row.created_at, images: [],
      });
    }
    if (row.img_url) {
      map.get(row.id).images.push({ url: row.img_url, is_primary: row.img_primary });
    }
  });
  return [...map.values()];
};

// ─── GET /api/products ───────────────────────────────────────
exports.getProducts = async (req, res) => {
  try {
    const {
      page = 1, limit = 12,
      category, pet_type, min_price, max_price,
      min_rating, search, sort = 'created_at', order = 'DESC',
      featured,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const where  = ['p.is_active = 1', 'u.is_approved = 1'];
    const params = [];

    if (category)   { where.push('c.slug = ?');          params.push(category); }
    if (pet_type)   { where.push('p.pet_type = ?');      params.push(pet_type); }
    if (min_price)  { where.push('p.price >= ?');        params.push(parseFloat(min_price)); }
    if (max_price)  { where.push('p.price <= ?');        params.push(parseFloat(max_price)); }
    if (min_rating) { where.push('p.rating >= ?');       params.push(parseFloat(min_rating)); }
    if (featured)   { where.push('p.is_featured = 1'); }
    if (search) {
      where.push('MATCH(p.name, p.description) AGAINST(? IN BOOLEAN MODE)');
      params.push(`${search}*`);
    }

    const whereStr = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // Allowed sort columns (whitelist against SQL injection)
    const sortMap = { price: 'p.price', rating: 'p.rating', created_at: 'p.created_at', sales: 'p.sales_count' };
    const sortCol = sortMap[sort] || 'p.created_at';
    const sortDir = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count query
    const [countRows] = await db.execute(
      `SELECT COUNT(DISTINCT p.id) AS total
       FROM products p
       JOIN users u    ON u.id = p.seller_id
       JOIN categories c ON c.id = p.category_id
       ${whereStr}`,
      params
    );

    const total = countRows[0].total;

    // Data query — join images separately (avoids N+1)
    const dataParams = [...params, parseInt(limit), offset];
    const [rows] = await db.execute(
      `SELECT p.*, c.name AS category_name,
              u.name AS seller_name, sp.shop_name,
              pi.url AS img_url, pi.is_primary AS img_primary
       FROM products p
       JOIN users u            ON u.id = p.seller_id
       JOIN categories c       ON c.id = p.category_id
       LEFT JOIN seller_profiles sp ON sp.user_id = p.seller_id
       LEFT JOIN product_images pi  ON pi.product_id = p.id
       ${whereStr}
       ORDER BY ${sortCol} ${sortDir}
       LIMIT ? OFFSET ?`,
      dataParams
    );

    const products = buildProductImages(rows);

    return res.json({
      success: true,
      data: products,
      pagination: {
        total,
        page:  parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('getProducts error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── GET /api/products/:id ───────────────────────────────────
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [rows] = await db.execute(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug,
              u.name AS seller_name, sp.shop_name, sp.rating AS shop_rating,
              pi.url AS img_url, pi.is_primary AS img_primary, pi.sort_order AS img_order
       FROM products p
       JOIN users u            ON u.id = p.seller_id
       JOIN categories c       ON c.id = p.category_id
       LEFT JOIN seller_profiles sp ON sp.user_id = p.seller_id
       LEFT JOIN product_images pi  ON pi.product_id = p.id
       WHERE p.id = ? AND p.is_active = 1
       ORDER BY pi.sort_order ASC`,
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const [product] = buildProductImages(rows);

    // Fetch recent reviews
    const [reviews] = await db.execute(
      `SELECT r.*, u.name AS reviewer_name, u.avatar AS reviewer_avatar
       FROM reviews r
       JOIN users u ON u.id = r.buyer_id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC
       LIMIT 10`,
      [id]
    );

    return res.json({ success: true, data: { ...product, reviews } });
  } catch (err) {
    console.error('getProduct error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── POST /api/products ─────────────────────────── seller ───
exports.createProduct = async (req, res) => {
  const { name, description, price, compare_price, stock, category_id,
          brand, pet_type, sku, weight } = req.body;

  try {
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;

    const [result] = await db.execute(
      `INSERT INTO products
         (seller_id, category_id, name, slug, description, price, compare_price,
          stock, brand, pet_type, sku, weight)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, category_id, name, slug, description,
       price, compare_price || null, stock, brand || null,
       pet_type || 'other', sku || null, weight || null]
    );

    const productId = result.insertId;

    // Save uploaded images
    if (req.files && req.files.length > 0) {
      const imgValues = req.files.map((file, i) =>
        `(${productId}, '/uploads/${file.filename}', ${i === 0 ? 1 : 0}, ${i})`
      ).join(',');
      await db.execute(
        `INSERT INTO product_images (product_id, url, is_primary, sort_order) VALUES ${imgValues}`
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Product created',
      data: { id: productId, slug },
    });
  } catch (err) {
    console.error('createProduct error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── PUT /api/products/:id ───────────────────────────────────
exports.updateProduct = async (req, res) => {
  const { id } = req.params;

  try {
    // Ownership check (admin can bypass)
    const [rows] = await db.execute(
      'SELECT seller_id FROM products WHERE id = ?', [id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (req.user.role !== 'admin' && rows[0].seller_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { name, description, price, compare_price, stock, category_id,
            brand, pet_type, sku, weight, is_featured, is_active } = req.body;

    await db.execute(
      `UPDATE products SET
         name = COALESCE(?, name), description = COALESCE(?, description),
         price = COALESCE(?, price), compare_price = COALESCE(?, compare_price),
         stock = COALESCE(?, stock), category_id = COALESCE(?, category_id),
         brand = COALESCE(?, brand), pet_type = COALESCE(?, pet_type),
         sku = COALESCE(?, sku), weight = COALESCE(?, weight),
         is_featured = COALESCE(?, is_featured), is_active = COALESCE(?, is_active)
       WHERE id = ?`,
      [name, description, price, compare_price, stock, category_id,
       brand, pet_type, sku, weight, is_featured, is_active, id]
    );

    if (req.files && req.files.length > 0) {
      const [countRows] = await db.execute(
        'SELECT COUNT(*) AS cnt FROM product_images WHERE product_id = ?',
        [id]
      );
      const existingCount = countRows[0].cnt || 0;
      const imgValues = req.files.map((file, i) =>
        `(${id}, '/uploads/${file.filename}', ${existingCount === 0 && i === 0 ? 1 : 0}, ${existingCount + i})`
      ).join(',');
      await db.execute(
        `INSERT INTO product_images (product_id, url, is_primary, sort_order) VALUES ${imgValues}`
      );
    }

    return res.json({ success: true, message: 'Product updated' });
  } catch (err) {
    console.error('updateProduct error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── DELETE /api/products/:id ────────────────────────────────
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await db.execute(
      'SELECT seller_id FROM products WHERE id = ?', [id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    if (req.user.role !== 'admin' && rows[0].seller_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    // Soft delete
    await db.execute('UPDATE products SET is_active = 0 WHERE id = ?', [id]);

    return res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    console.error('deleteProduct error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── GET /api/products/seller/mine ───────────────────────────
exports.getSellerProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const [rows] = await db.execute(
      `SELECT p.id, p.name, p.price, p.stock, p.rating, p.review_count,
              p.sales_count, p.is_active, p.is_featured, p.created_at,
              c.name AS category_name,
              (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS image
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.seller_id = ?
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [req.user.id, parseInt(limit), offset]
    );

    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getSellerProducts error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── GET /api/categories ─────────────────────────────────────
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT c.*, COUNT(p.id) AS product_count
       FROM categories c
       LEFT JOIN products p ON p.category_id = c.id AND p.is_active = 1
       GROUP BY c.id
       ORDER BY c.name ASC`
    );
    return res.json({ success: true, data: rows });
  } catch (err) {
    console.error('getCategories error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── POST /api/products/:id/reviews ─────────────────────────
exports.addReview = async (req, res) => {
  const { id: product_id } = req.params;
  const { rating, title, body, order_id } = req.body;

  try {
    await db.execute(
      'INSERT INTO reviews (product_id, buyer_id, order_id, rating, title, body) VALUES (?, ?, ?, ?, ?, ?)',
      [product_id, req.user.id, order_id, rating, title || null, body || null]
    );

    // Recalculate product rating
    const [ratingRows] = await db.execute(
      'SELECT AVG(rating) AS avg_rating, COUNT(*) AS cnt FROM reviews WHERE product_id = ?',
      [product_id]
    );
    await db.execute(
      'UPDATE products SET rating = ?, review_count = ? WHERE id = ?',
      [ratingRows[0].avg_rating, ratingRows[0].cnt, product_id]
    );

    return res.status(201).json({ success: true, message: 'Review submitted' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'You already reviewed this product' });
    }
    console.error('addReview error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};
