const express = require('express');
const router = express.Router();
const postreController = require('../controllers/postreController');
const { authMiddleware, restrictTo } = require('../middlewares/authMiddleware');

router.post('/crear', authMiddleware, restrictTo('administrador'), postreController.createPostre);
router.get('/listar', authMiddleware, restrictTo('administrador'), postreController.getAllPostres);
router.get('/buscar/:id', authMiddleware, restrictTo('administrador'), postreController.getPostreById);
router.put('/actualizar/:id', authMiddleware, restrictTo('administrador'), postreController.updatePostre);
router.patch('/:id/activar', authMiddleware, restrictTo('administrador'), postreController.toggleActivarPostre);
router.delete('/borrar/:id', authMiddleware, restrictTo('administrador'), postreController.deletePostre);

module.exports = router;
//postres terminado