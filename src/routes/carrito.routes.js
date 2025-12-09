const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carrito.controller');

// Obtener carrito de un usuario
router.get('/:usuarioId', carritoController.obtenerCarrito);

// Agregar o incrementar producto en carrito
router.post('/:usuarioId/items', carritoController.agregarItem);

// Eliminar un producto del carrito
router.delete('/:usuarioId/items/:productoId', carritoController.eliminarItem);

// Vaciar carrito completo
router.delete('/:usuarioId', carritoController.vaciarCarrito);

module.exports = router;
