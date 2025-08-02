const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { authMiddleware, restrictTo } = require('../middlewares/authMiddleware');
//ok
router.get('/listar', authMiddleware, restrictTo('administrador', 'operador'), clienteController.getAllClientes);
//falta implementar en el frontend
router.get('/buscarId/:id', authMiddleware, restrictTo('administrador', 'operador'), clienteController.getClienteById);
//ok
router.post('/crear', authMiddleware, restrictTo('administrador', 'operador'), clienteController.createCliente);
//ok
router.put('/actualizar/:id', authMiddleware, restrictTo('administrador', 'operador'), clienteController.updateCliente);
//ok
router.put('/activar/:id', authMiddleware, restrictTo('administrador'), clienteController.activateCliente);

//ok
router.put('/suspender/:id', authMiddleware, restrictTo('administrador'), clienteController.suspendCliente);
//ok
router.delete('/eliminar/:id', authMiddleware, restrictTo('administrador'), clienteController.deleteCliente);
//ok
router.get('/buscar', authMiddleware, restrictTo('administrador', 'operador'), clienteController.searchClientes);

router.get('/:id/cotizaciones', authMiddleware, restrictTo('administrador', 'operador'), clienteController.getClienteCotizaciones);

module.exports = router;
//cambiado delete por put en  (suspender cliente)