// routes/auth.js
const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

const loginRules = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
];
const registerRules = [
  body('name').trim().isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['buyer', 'seller']),
];

router.post('/register', registerRules, ctrl.register);
router.post('/login',    loginRules,    ctrl.login);
router.get ('/me',       authenticate,  ctrl.getMe);
router.put ('/profile',  authenticate,  upload.single('avatar'), ctrl.updateProfile);

module.exports = router;
