// src/routes/pedidos.routes.js
const router = require('express').Router();
const pedidosController = require('../controllers/pedidos.controller');

// GET /api/pedidos - Obtener todos los pedidos activos (READ)
router.get('/', pedidosController.getAllPedidos);

// GET /api/pedidos/:id - Obtener un pedido por ID
router.get('/:id', pedidosController.getPedidoById);

// POST /api/pedidos - Crear un nuevo pedido (CREATE)
router.post('/', pedidosController.createPedido);

// PATCH /api/pedidos/:id - Actualizar el estado del pedido (UPDATE)
router.patch('/:id', pedidosController.updatePedido); 

// DELETE /api/pedidos/:id - Borrado Lógico (DELETE)
router.delete('/:id', pedidosController.deletePedido);

module.exports = router;