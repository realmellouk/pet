const adminRouter = require('express').Router();
const cartRouter  = require('express').Router();
const adminCtrl   = require('../controllers/adminController');
const cartCtrl    = require('../controllers/cartController');
const { authenticate, authorize } = require('../middleware/auth');

const adminOnly = [authenticate, authorize('admin')];

// Admin routes
adminRouter.get('/stats',             ...adminOnly, adminCtrl.getDashboardStats);
adminRouter.get('/users',             ...adminOnly, adminCtrl.getUsers);
adminRouter.put('/users/:id/approve', ...adminOnly, adminCtrl.approveSeller);
adminRouter.put('/users/:id/toggle',  ...adminOnly, adminCtrl.toggleUser);
adminRouter.delete('/users/:id',      ...adminOnly, adminCtrl.deleteUser);
adminRouter.get('/orders',            ...adminOnly, adminCtrl.getAllOrders);
adminRouter.get('/products',          ...adminOnly, adminCtrl.getAllProducts);

// Cart routes
cartRouter.get('/',         authenticate, cartCtrl.getCart);
cartRouter.post('/',        authenticate, cartCtrl.addToCart);
cartRouter.put('/:id',      authenticate, cartCtrl.updateCartItem);
cartRouter.delete('/:id',   authenticate, cartCtrl.removeCartItem);
cartRouter.delete('/',      authenticate, cartCtrl.clearCart);

module.exports = { cartRouter, adminRouter };