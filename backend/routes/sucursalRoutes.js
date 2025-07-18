const express = require('express');
const router = express.Router();
const sucursalController = require('../controllers/sucursalController');
const { authMiddleware, restrictTo } = require('../middlewares/authMiddleware');

router.get('/listar', authMiddleware, restrictTo('administrador'), sucursalController.getAllSucursales);
router.get('/:id', authMiddleware, restrictTo('administrador'), sucursalController.getSucursalById);
router.post('/crear', authMiddleware, restrictTo('administrador'), sucursalController.createSucursal);
router.put('/actualizar/:id', authMiddleware, restrictTo('administrador'), sucursalController.updateSucursal);
router.delete('/eliminar/:id', authMiddleware, restrictTo('administrador'), sucursalController.deleteSucursal);

module.exports = router;