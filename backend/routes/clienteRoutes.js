const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { authMiddleware, restrictTo } = require('../middlewares/authMiddleware');

router.get('/listar', authMiddleware, restrictTo('administrador', 'operador'), clienteController.getAllClientes);
router.get('/buscarId/:id', authMiddleware, restrictTo('administrador', 'operador'), clienteController.getClienteById);
router.post('/crear', authMiddleware, restrictTo('administrador', 'operador'), clienteController.createCliente);
router.put('/actualizar/:id', authMiddleware, restrictTo('administrador', 'operador'), clienteController.updateCliente);
router.delete('/suspender/:id', authMiddleware, restrictTo('administrador'), clienteController.suspendCliente);
router.get('/buscar', authMiddleware, restrictTo('administrador', 'operador'), clienteController.searchClientes);
router.get('/:id/cotizaciones', authMiddleware, restrictTo('administrador', 'operador'), clienteController.getClienteCotizaciones);

module.exports = router;