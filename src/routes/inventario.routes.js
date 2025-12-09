// src/routes/inventario.routes.js
const router = require('express').Router();
const inventarioController = require('../controllers/inventario.controller');

// GET /api/inventario - Obtener existencias activas
router.get('/', inventarioController.getExistencias);

// GET /api/inventario/:productoId - Obtener stock de un producto
router.get('/:productoId', inventarioController.getInventarioByProducto);

// POST /api/inventario/ajustar - Ajustar/Crear existencias
router.post('/ajustar', inventarioController.ajustarInventario);

// PATCH /api/inventario/:productoId - Actualizar ubicación
router.patch('/:productoId', inventarioController.updateInventario); 

// DELETE /api/inventario/:productoId - Borrado Lógico
router.delete('/:productoId', inventarioController.deleteInventario);

module.exports = router;