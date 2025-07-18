const express = require('express');
const router = express.Router();
const tortaBaseController = require('../controllers/tortaBaseController');
const { authMiddleware, restrictTo } = require('../middlewares/authMiddleware');

router.get('/listar', authMiddleware, restrictTo('administrador'), tortaBaseController.getAllTortasBase);
router.get('/:id', authMiddleware, restrictTo('administrador'), tortaBaseController.getTortaBaseById);
router.post('/crear', authMiddleware, restrictTo('administrador'), tortaBaseController.createTortaBase);
router.put('/actualizar/:id', authMiddleware, restrictTo('administrador'), tortaBaseController.updateTortaBase);
router.delete('eliminar/:id', authMiddleware, restrictTo('administrador'), tortaBaseController.deleteTortaBase);
router.post('/:id/precios', authMiddleware, restrictTo('administrador'), tortaBaseController.addPrecioPorcion);
router.put('/:id/precios/:precio_id', authMiddleware, restrictTo('administrador'), tortaBaseController.updatePrecioPorcion);
router.delete('/:id/precios/:precio_id', authMiddleware, restrictTo('administrador'), tortaBaseController.deletePrecioPorcion);

module.exports = router;