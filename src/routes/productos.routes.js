const express = require("express");
const router = express.Router();
const productosController = require("../controllers/productos.controller");

// Rutas recursos productos
router.get("/", productosController.obtenerProductos);
router.get("/:id", productosController.obtenerProductoPorId);
router.post("/", productosController.crearProducto);
router.patch("/:id", productosController.actualizarProducto);
router.delete("/:id", productosController.borrarProductoLogico);

module.exports = router;


