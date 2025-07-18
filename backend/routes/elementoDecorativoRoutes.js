const express = require('express');
const router = express.Router();
const elementoDecorativoController = require('../controllers/elementoDecorativoController');
const { authMiddleware, restrictTo } = require('../middlewares/authMiddleware');

router.post('/crear', authMiddleware, restrictTo('administrador'), elementoDecorativoController.createElementoDecorativo);
router.get('/listar', authMiddleware, restrictTo('administrador'), elementoDecorativoController.getAllElementosDecorativos);
router.get('buscar/:id', authMiddleware, restrictTo('administrador'), elementoDecorativoController.getElementoDecorativoById);
router.put('/actualizar/:id', authMiddleware, restrictTo('administrador'), elementoDecorativoController.updateElementoDecorativo);
router.delete('/eliminar/:id', authMiddleware, restrictTo('administrador'), elementoDecorativoController.deleteElementoDecorativo);

module.exports = router;