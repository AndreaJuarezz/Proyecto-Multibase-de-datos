// src/app.js

require('dotenv').config(); // <-- 1. Cargar variables de entorno

const express = require('express');
const cors = require('cors');

// Importamos el middleware de errores
const { notFound, errorHandler } = require('./middleware/error.middleware'); // <-- 2. IMPORTAR MIDDLEWARE

const connectMySQL = require('./db/mysql');
const connectMongo = require('./db/mongo');
const connectRedis = require('./db/redis');

// 1. IMPORTAR TODAS LAS RUTAS 
const categoriasRoutes = require('./routes/categorias.routes');
const productosRoutes = require('./routes/productos.routes');
const inventarioRoutes = require('./routes/inventario.routes');
const pedidosRoutes = require('./routes/pedidos.routes');
const carritoRoutes = require('./routes/carrito.routes');
const usuariosRoutes = require('./usuarios/usuario.routes');

const app = express();

app.use(cors());
app.use(express.json());

// Conectar bases de datos al iniciar
(async () => {
    await connectMySQL();
    await connectMongo();
    await connectRedis();
})();

// Ruta de prueba
app.get('/', (req, res) => {
    res.send('API Multibase funcionando correctamente ');
});

// 2. REGISTRAR LAS RUTAS 
app.use('/api/categorias', categoriasRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/inventario', inventarioRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/carrito', carritoRoutes);
app.use('/api/usuarios', usuariosRoutes);

// 3. REGISTRO DEL MIDDLEWARE DE ERRORES (DEBE IR AL FINAL)
app.use(notFound);       // Maneja Rutas 404
app.use(errorHandler);   // Maneja Errores 500

// Exportar app
module.exports = app;