-- ============================================================
-- PET MARKETPLACE — Full MySQL Schema
-- ============================================================

CREATE DATABASE IF NOT EXISTS pet_marketplace
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE pet_marketplace;

-- ─── USERS ───────────────────────────────────────────────────
CREATE TABLE users (
  id           INT          UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  role         ENUM('buyer','seller','admin') NOT NULL DEFAULT 'buyer',
  avatar       VARCHAR(500) DEFAULT NULL,
  phone        VARCHAR(20)  DEFAULT NULL,
  is_approved  TINYINT(1)   NOT NULL DEFAULT 0,  -- for sellers: admin must approve
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role  (role),
  INDEX idx_email (email)
);

-- ─── SELLER PROFILES ─────────────────────────────────────────
CREATE TABLE seller_profiles (
  id           INT          UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id      INT          UNSIGNED NOT NULL UNIQUE,
  shop_name    VARCHAR(150) NOT NULL,
  shop_desc    TEXT         DEFAULT NULL,
  shop_logo    VARCHAR(500) DEFAULT NULL,
  shop_banner  VARCHAR(500) DEFAULT NULL,
  address      VARCHAR(300) DEFAULT NULL,
  rating       DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  total_sales  INT          UNSIGNED NOT NULL DEFAULT 0,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ─── CATEGORIES ──────────────────────────────────────────────
CREATE TABLE categories (
  id          INT          UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(80)  NOT NULL UNIQUE,
  slug        VARCHAR(80)  NOT NULL UNIQUE,
  description TEXT         DEFAULT NULL,
  icon        VARCHAR(100) DEFAULT NULL,   -- emoji or icon name
  image       VARCHAR(500) DEFAULT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ─── PRODUCTS ────────────────────────────────────────────────
CREATE TABLE products (
  id           INT          UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  seller_id    INT          UNSIGNED NOT NULL,
  category_id  INT          UNSIGNED NOT NULL,
  name         VARCHAR(200) NOT NULL,
  slug         VARCHAR(220) NOT NULL UNIQUE,
  description  TEXT         NOT NULL,
  price        DECIMAL(10,2) NOT NULL,
  compare_price DECIMAL(10,2) DEFAULT NULL,  -- original price for discount display
  stock        INT          UNSIGNED NOT NULL DEFAULT 0,
  sku          VARCHAR(100) DEFAULT NULL UNIQUE,
  brand        VARCHAR(100) DEFAULT NULL,
  weight       DECIMAL(8,2) DEFAULT NULL,    -- kg
  pet_type     ENUM('dog','cat','bird','fish','rabbit','reptile','other') DEFAULT 'other',
  is_active    TINYINT(1)   NOT NULL DEFAULT 1,
  is_featured  TINYINT(1)   NOT NULL DEFAULT 0,
  rating       DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  review_count INT          UNSIGNED NOT NULL DEFAULT 0,
  sales_count  INT          UNSIGNED NOT NULL DEFAULT 0,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id)   REFERENCES users(id)       ON DELETE CASCADE,
  FOREIGN KEY (category_id) REFERENCES categories(id)  ON DELETE RESTRICT,
  INDEX idx_seller     (seller_id),
  INDEX idx_category   (category_id),
  INDEX idx_pet_type   (pet_type),
  INDEX idx_price      (price),
  INDEX idx_rating     (rating),
  FULLTEXT INDEX ft_name_desc (name, description)
);

-- ─── PRODUCT IMAGES ──────────────────────────────────────────
CREATE TABLE product_images (
  id          INT          UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  INT          UNSIGNED NOT NULL,
  url         VARCHAR(500) NOT NULL,
  alt_text    VARCHAR(200) DEFAULT NULL,
  is_primary  TINYINT(1)   NOT NULL DEFAULT 0,
  sort_order  INT          UNSIGNED NOT NULL DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_product (product_id)
);

-- ─── ORDERS ──────────────────────────────────────────────────
CREATE TABLE orders (
  id              INT          UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  buyer_id        INT          UNSIGNED NOT NULL,
  status          ENUM('pending','confirmed','processing','shipped','delivered','cancelled','refunded')
                  NOT NULL DEFAULT 'pending',
  total_amount    DECIMAL(10,2) NOT NULL,
  shipping_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_method  ENUM('cod','stripe','paypal') NOT NULL DEFAULT 'cod',
  payment_status  ENUM('unpaid','paid','refunded') NOT NULL DEFAULT 'unpaid',
  -- Shipping address (snapshot at order time)
  shipping_name    VARCHAR(100) NOT NULL,
  shipping_phone   VARCHAR(20)  NOT NULL,
  shipping_address VARCHAR(300) NOT NULL,
  shipping_city    VARCHAR(80)  NOT NULL,
  shipping_zip     VARCHAR(20)  DEFAULT NULL,
  notes            TEXT         DEFAULT NULL,
  created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE RESTRICT,
  INDEX idx_buyer  (buyer_id),
  INDEX idx_status (status)
);

-- ─── ORDER ITEMS ─────────────────────────────────────────────
CREATE TABLE order_items (
  id           INT          UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id     INT          UNSIGNED NOT NULL,
  product_id   INT          UNSIGNED NOT NULL,
  seller_id    INT          UNSIGNED NOT NULL,
  quantity     INT          UNSIGNED NOT NULL,
  unit_price   DECIMAL(10,2) NOT NULL,   -- snapshot of price at purchase time
  total_price  DECIMAL(10,2) NOT NULL,
  -- Product snapshot (in case product is deleted later)
  product_name VARCHAR(200) NOT NULL,
  product_image VARCHAR(500) DEFAULT NULL,
  item_status  ENUM('pending','confirmed','shipped','delivered','cancelled')
               NOT NULL DEFAULT 'pending',
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  FOREIGN KEY (seller_id)  REFERENCES users(id)    ON DELETE RESTRICT,
  INDEX idx_order   (order_id),
  INDEX idx_seller  (seller_id),
  INDEX idx_product (product_id)
);

-- ─── REVIEWS ─────────────────────────────────────────────────
CREATE TABLE reviews (
  id          INT          UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  INT          UNSIGNED NOT NULL,
  buyer_id    INT          UNSIGNED NOT NULL,
  order_id    INT          UNSIGNED NOT NULL,
  rating      TINYINT      UNSIGNED NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title       VARCHAR(150) DEFAULT NULL,
  body        TEXT         DEFAULT NULL,
  is_verified TINYINT(1)   NOT NULL DEFAULT 1,  -- purchased & delivered
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_review (product_id, buyer_id, order_id),
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id)   REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (order_id)   REFERENCES orders(id)   ON DELETE CASCADE,
  INDEX idx_product (product_id),
  INDEX idx_buyer   (buyer_id)
);

-- ─── CART ────────────────────────────────────────────────────
CREATE TABLE cart_items (
  id          INT          UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT          UNSIGNED NOT NULL,
  product_id  INT          UNSIGNED NOT NULL,
  quantity    INT          UNSIGNED NOT NULL DEFAULT 1,
  added_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_cart_item (user_id, product_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ─── WISHLIST ────────────────────────────────────────────────
CREATE TABLE wishlist (
  id          INT          UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id     INT          UNSIGNED NOT NULL,
  product_id  INT          UNSIGNED NOT NULL,
  added_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_wishlist (user_id, product_id),
  FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ─── SEED DATA ───────────────────────────────────────────────

-- Admin account (password: Admin@123)
INSERT INTO users (name, email, password, role, is_approved) VALUES
  ('Admin', 'admin@petmarket.com',
   '$2a$12$UD1YK6wHnglUJxwiolW8DuNt47hE3lTTyOXUxwq0uZ42fneYTGN3u',
   'admin', 1);

-- Categories
INSERT INTO categories (name, slug, description, icon) VALUES
  ('Dog Food',       'dog-food',       'Premium nutrition for dogs',         '🐕'),
  ('Cat Food',       'cat-food',       'Delicious meals for cats',           '🐈'),
  ('Bird Supplies',  'bird-supplies',  'Everything for your feathered friend','🦜'),
  ('Fish & Aquatic', 'fish-aquatic',   'Tanks, food & accessories',          '🐠'),
  ('Toys & Play',    'toys-play',      'Keep your pets entertained',         '🎾'),
  ('Grooming',       'grooming',       'Shampoos, brushes and more',         '✂️'),
  ('Health & Vet',   'health-vet',     'Vitamins, meds & supplements',       '💊'),
  ('Beds & Furniture','beds-furniture','Comfy resting spots for pets',       '🛏️');
