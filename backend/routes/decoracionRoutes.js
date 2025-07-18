const express = require('express');
const router = express.Router();
const decoracionController = require('../controllers/decoracionController');
const { authMiddleware, restrictTo } = require('../middlewares/authMiddleware');

router.post('/crear', authMiddleware, restrictTo('administrador'), decoracionController.createDecoracion);
router.get('/listar', authMiddleware, restrictTo('administrador'), decoracionController.getAllDecoraciones);
router.get('/:id', authMiddleware, restrictTo('administrador'), decoracionController.getDecoracionById);
router.put('/actualizar/:id', authMiddleware, restrictTo('administrador'), decoracionController.updateDecoracion);
router.patch('/:id/estado', authMiddleware, restrictTo('administrador'), decoracionController.toggleEstadoDecoracion);
router.delete('/eliminar/:id', authMiddleware, restrictTo('administrador'), decoracionController.deleteDecoracion);

router.post('/:id/rangos', authMiddleware, restrictTo('administrador'), decoracionController.addPrecioPorcion);
router.get('/:id/rangos', authMiddleware, restrictTo('administrador'), decoracionController.getPreciosByDecoracion);
router.put('/:rango_id', authMiddleware, restrictTo('administrador'), decoracionController.updatePrecioPorcion);
router.delete('/:rango_id', authMiddleware, restrictTo('administrador'), decoracionController.deletePrecioPorcion);

module.exports = router;