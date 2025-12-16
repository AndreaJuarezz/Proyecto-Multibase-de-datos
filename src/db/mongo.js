// src/db/mongo.js
const mongoose = require('mongoose');

async function connectMongo() {
    try {
        // <<-- CORREGIDO: Usando la variable de entorno MONGO_URL
        await mongoose.connect(process.env.MONGO_URL); 
        console.log(' MongoDB conectado correctamente');
    } catch (error) {
        // Es útil mostrar el mensaje del error para depuración
        console.error(' Error conectando a MongoDB:', error.message);
    }
}

module.exports = connectMongo;