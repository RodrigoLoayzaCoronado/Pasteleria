const express = require('express');
const router = express.Router();
const detalleTortaController = require('../controllers/detalleTortaController');
const { authMiddleware, restrictTo } = require('../middlewares/authMiddleware');

router.post('/crear', authMiddleware, restrictTo('administrador', 'operador'), detalleTortaController.createDetalleTorta);
router.get('/listar', authMiddleware, restrictTo('administrador', 'operador'), detalleTortaController.getDetalleTortaById);

router.put('/actualizar/:id', authMiddleware, restrictTo('administrador'), detalleTortaController.updateDetalleTorta);
router.delete('/eliminar/:id', authMiddleware, restrictTo('administrador'), detalleTortaController.deleteDetalleTorta);
module.exports = router;