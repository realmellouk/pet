// routes/orders.js
const router = require('express').Router();
const ctrl   = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

router.post ('/',         authenticate, authorize('buyer'),          ctrl.createOrder);
router.get  ('/user',     authenticate, authorize('buyer'),          ctrl.getBuyerOrders);
router.get  ('/seller',   authenticate, authorize('seller'),         ctrl.getSellerOrders);
router.get  ('/:id',      authenticate,                              ctrl.getOrderDetail);
router.put  ('/:id/status', authenticate, authorize('seller','admin'), ctrl.updateOrderStatus);

module.exports = router;
