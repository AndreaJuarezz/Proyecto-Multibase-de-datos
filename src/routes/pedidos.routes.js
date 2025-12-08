// src/routes/pedidos.routes.js
const router = require('express').Router();
const pedidosController = require('../controllers/pedidos.controller');

// GET /api/pedidos - Obtener todos los pedidos activos (READ)
router.get('/', pedidosController.getAllPedidos);

// POST /api/pedidos - Crear un nuevo pedido (CREATE)
router.post('/', pedidosController.createPedido);

// PATCH /api/pedidos/:id_pedido - Actualizar el estado del pedido (UPDATE)
router.patch('/:id_pedido', pedidosController.updatePedido); 

// DELETE /api/pedidos/:id_pedido - Borrado Lógico (DELETE)
router.delete('/:id_pedido', pedidosController.deletePedido);

module.exports = router;