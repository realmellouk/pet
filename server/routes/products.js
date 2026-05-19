// routes/products.js
const router = require('express').Router();
const ctrl   = require('../controllers/productController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/categories',          ctrl.getCategories);
router.get('/',                    ctrl.getProducts);
router.get('/seller/mine',         authenticate, authorize('seller'), ctrl.getSellerProducts);
router.get('/:id',                 ctrl.getProduct);

// Seller routes
router.post(
  '/',
  authenticate, authorize('seller'),
  upload.array('images', 6),
  ctrl.createProduct
);
router.put (
  '/:id',
  authenticate, authorize('seller', 'admin'),
  upload.array('images', 6),
  ctrl.updateProduct
);
router.delete('/:id', authenticate, authorize('seller', 'admin'), ctrl.deleteProduct);

// Reviews
router.post('/:id/reviews', authenticate, authorize('buyer'), ctrl.addReview);

module.exports = router;
