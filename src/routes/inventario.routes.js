// src/routes/inventario.routes.js
const router = require('express').Router();
const inventarioController = require('../controllers/inventario.controller');

// GET /api/inventario - Obtener existencias activas (READ)
router.get('/', inventarioController.getExistencias);

// POST /api/inventario/ajustar - Ajustar/Crear existencias (CREATE/UPDATE)
router.post('/ajustar', inventarioController.ajustarInventario);

// PATCH /api/inventario/:id_producto - Actualizar campos específicos (UPDATE)
router.patch('/:id_producto', inventarioController.updateInventario); 

// DELETE /api/inventario/:id_producto - Borrado Lógico (DELETE)
router.delete('/:id_producto', inventarioController.deleteInventario);

module.exports = router;