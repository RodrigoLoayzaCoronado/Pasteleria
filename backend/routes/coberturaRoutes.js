const express = require('express');
const router = express.Router();
const coberturaController = require('../controllers/coberturaController');
const { authMiddleware, restrictTo } = require('../middlewares/authMiddleware');

router.get('/listar', authMiddleware, restrictTo('administrador'), coberturaController.getAllCoberturas);
router.get('/:id', authMiddleware, restrictTo('administrador'), coberturaController.getCoberturaById);
router.post('/crear', authMiddleware, restrictTo('administrador'), coberturaController.createCobertura);
router.put('/actualizar/:id', authMiddleware, restrictTo('administrador'), coberturaController.updateCobertura);
router.delete('/eliminar/:id', authMiddleware, restrictTo('administrador'), coberturaController.deleteCobertura);
router.post('/:id/rangos', authMiddleware, restrictTo('administrador'), coberturaController.addPrecioPorcion);
router.put('/:id/rangos/:rango_id', authMiddleware, restrictTo('administrador'), coberturaController.updatePrecioPorcion);
router.delete('/:id/rangos/:rango_id', authMiddleware, restrictTo('administrador'), coberturaController.deletePrecioPorcion);

module.exports = router;