const express = require('express');
const router = express.Router();
const cotizacionController = require('../controllers/cotizacionController');
const { authMiddleware, restrictTo } = require('../middlewares/authMiddleware');

// Rutas para Cotizaciones
router.post('/crear',authMiddleware, restrictTo('administrador','operador'), cotizacionController.createCotizacion);
router.get('/listar',authMiddleware,restrictTo('administrador','operador'), cotizacionController.getAllCotizaciones);
router.get('/:id',authMiddleware,restrictTo('administrador','operador'), cotizacionController.getCotizacionById);
router.put('/:id',authMiddleware,restrictTo('administrador','operador'), cotizacionController.updateCotizacion);
router.put('/:id/status',authMiddleware,restrictTo('administrador','operador'), cotizacionController.updateCotizacionStatus);
router.get('/buscar', authMiddleware, restrictTo('administrador', 'operador'), cotizacionController.searchCotizacionesByTortaName);
router.get('/items', authMiddleware, restrictTo('administrador', 'operador'), cotizacionController.getItemsCotizacionByQuery);
//router.delete('/:id', authMiddleware, restrictTo('administrador', 'operador'), cotizacionController.deleteCotizacion);
// Rutas para ítems de Cotización (anidadas)
router.post('/:id/items',authMiddleware,restrictTo('administrador','operador'), cotizacionController.addItemToCotizacion); // :id es cotizacionId
router.put('/:cotizacionId/items/:itemId',authMiddleware,restrictTo('administrador','operador'), cotizacionController.updateItemInCotizacion);
router.delete('/:cotizacionId/items/:itemId', authMiddleware,restrictTo('administrador','operador'), cotizacionController.removeItemFromCotizacion);

module.exports = router;

//falta comprobar si la demas rutas funcionan correctamente
//create funciona bien 
//comparar los archivos cotizacionCotnroller.js desarrollado y el cotizacionesController.js de depseek y desarrollar el frontend
