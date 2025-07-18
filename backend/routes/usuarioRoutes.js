const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authMiddleware, restrictTo } = require('../middlewares/authMiddleware');
const { route } = require('./authRoutes');

router.get('/perfil', authMiddleware, usuarioController.getPerfil);
router.put('/actualizar/:id', authMiddleware, usuarioController.updatePerfil);

router.get('/listar', authMiddleware, restrictTo('administrador'), usuarioController.getAllUsuarios);
router.get('/:id', authMiddleware, restrictTo('administrador'), usuarioController.getUsuarioById);
router.post('/crear', authMiddleware, restrictTo('administrador'), usuarioController.createUsuario);
router.put('/actualizar/:id', authMiddleware, restrictTo('administrador'), usuarioController.updateUsuario);
router.put('/:id/reset-password', authMiddleware, restrictTo('administrador'), usuarioController.resetUsuarioPassword);
router.put('/:id/bloquear', authMiddleware, restrictTo('administrador'), usuarioController.bloquearUsuario);
router.put('/:id/desbloquear', authMiddleware, restrictTo('administrador'), usuarioController.desbloquearUsuario);
router.delete('/:id', authMiddleware, restrictTo('administrador'), usuarioController.deleteUsuario);

module.exports = router;