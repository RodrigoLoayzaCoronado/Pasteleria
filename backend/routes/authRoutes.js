const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware, restrictTo } = require('../middlewares/authMiddleware');

router.post('/login', authController.login);
router.post('/register', authMiddleware, authController.register);
router.post('/logout', authMiddleware, authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

module.exports = router;