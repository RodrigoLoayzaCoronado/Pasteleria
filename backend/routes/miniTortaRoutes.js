const express = require('express');
const router = express.Router();
const miniTortaController = require('../controllers/miniTortaController');
const { authMiddleware, restrictTo } = require('../middlewares/authMiddleware');

router.get('/listar', authMiddleware, restrictTo('administrador'), miniTortaController.getAllMiniTortas);
router.get('/:id', authMiddleware, restrictTo('administrador'), miniTortaController.getMiniTortaById);
router.post('/crear', authMiddleware, restrictTo('administrador'), miniTortaController.createMiniTorta);
router.put('/actualizar/:id', authMiddleware, restrictTo('administrador'), miniTortaController.updateMiniTorta);
router.delete('/:id', authMiddleware, restrictTo('administrador'), miniTortaController.deleteMiniTorta);
router.post('/:id/precios', authMiddleware, restrictTo('administrador'), miniTortaController.addPrecioPorcion);
router.put('/:id/precios/:precio_id', authMiddleware, restrictTo('administrador'), miniTortaController.updatePrecioPorcion);
router.delete('/:id/precios/:precio_id', authMiddleware, restrictTo('administrador'), miniTortaController.deletePrecioPorcion);

module.exports = router;