// src/carrito/carrito.routes.js
const express = require('express');
const router = express.Router();
const servicio = require('./carrito.service');

// POST /api/carrito  { userId, productoId, cantidad }
router.post('/', async (req, res) => {
  const { userId, productoId, cantidad } = req.body;
  try {
    await servicio.agregarAlCarrito(userId, productoId, cantidad || 1);
    res.status(201).json({ message: 'Producto agregado' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/carrito/:userId
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;
  const carrito = await servicio.obtenerCarrito(userId);
  res.json(carrito);
});

// DELETE /api/carrito/:userId/producto/:productoId
router.delete('/:userId/producto/:productoId', async (req, res) => {
  const { userId, productoId } = req.params;
  await servicio.eliminarProducto(userId, productoId);
  res.json({ message: 'Producto eliminado' });
});

// DELETE /api/carrito/:userId
router.delete('/:userId', async (req, res) => {
  const { userId } = req.params;
  await servicio.vaciarCarrito(userId);
  res.json({ message: 'Carrito vaciado' });
});

module.exports = router;
