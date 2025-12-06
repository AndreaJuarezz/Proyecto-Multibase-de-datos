// src/app.js
const express = require('express');
const cors = require('cors');

const connectMySQL = require('./db/mysql');
const connectMongo = require('./db/mongo');
const connectRedis = require('./db/redis');

// IMPORTAR RUTA DE CATEGORIAS
const categoriasRoutes = require('./routes/categorias.routes');

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

// 👇👇👇 AQUI REGISTRAS LA RUTA DE CATEGORIAS 👇👇👇
app.use('/api/categorias', categoriasRoutes);

// Exportar app
module.exports = app;
