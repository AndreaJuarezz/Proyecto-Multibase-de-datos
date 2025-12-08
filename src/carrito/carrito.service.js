// src/carrito/carrito.service.js
const redisClient = require('../redisClient'); // ajusta la ruta según su proyecto

const prefix = 'carrito:';

// Agregar producto al carrito
async function agregarAlCarrito(userId, productoId, cantidad = 1) {
  const key = `${prefix}${userId}`;
  await redisClient.hSet(key, productoId, cantidad.toString());
}

// Obtener carrito de un usuario
async function obtenerCarrito(userId) {
  const key = `${prefix}${userId}`;
  const items = await redisClient.hGetAll(key);
  return items; // { productoId: cantidad, ... }
}

// Eliminar un producto del carrito
async function eliminarProducto(userId, productoId) {
  const key = `${prefix}${userId}`;
  await redisClient.hDel(key, productoId);
}

// Vaciar carrito
async function vaciarCarrito(userId) {
  const key = `${prefix}${userId}`;
  await redisClient.del(key);
}

module.exports = {
  agregarAlCarrito,
  obtenerCarrito,
  eliminarProducto,
  vaciarCarrito
};
