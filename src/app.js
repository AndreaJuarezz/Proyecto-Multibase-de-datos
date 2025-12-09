// src/app.js
const express = require('express');
const cors = require('cors');

const connectMySQL = require('./db/mysql');
const connectMongo = require('./db/mongo');
const connectRedis = require('./db/redis');

//1. IMPORTAR TODAS LAS RUTAS 
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
    res.send('API Multibase funcionando correctamente 🚀');
});

//  2. REGISTRAR LAS RUTAS 
app.use('/api/categorias', categoriasRoutes);
app.use('/api/productos', productosRoutes); // <-- PRODUCTOS REGISTRO
app.use('/api/inventario', inventarioRoutes); // <-- NUEVO REGISTRO
app.use('/api/pedidos', pedidosRoutes); // <-- NUEVO REGISTRO
app.use('/api/carrito', carritoRoutes);
app.use('/api/usuarios', usuariosRoutes);
// Exportar app
module.exports = app;