const express = require('express');
const router = express.Router();
const extraController = require('../controllers/extraController');
const { authMiddleware, restrictTo } = require('../middlewares/authMiddleware');

router.post('/crear', authMiddleware, restrictTo('administrador'), extraController.createExtra);
router.get('/listar', authMiddleware, restrictTo('administrador'), extraController.getAllExtras);
router.get('/buscar/:id', authMiddleware, restrictTo('administrador'), extraController.getExtraById);
router.put('/desactivar/:id', authMiddleware, restrictTo('administrador'), extraController.updateExtra);
router.delete('/extras/:id', authMiddleware, restrictTo('administrador'), extraController.deleteExtra);
router.patch('/activar/:id/reactivar', authMiddleware, restrictTo('administrador'), extraController.reactivarExtra);

module.exports = router;