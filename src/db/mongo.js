// src/db/mongo.js
const mongoose = require('mongoose');

async function connectMongo() {
    try {
        await mongoose.connect('mongodb://localhost:27017/ecommerce');
        console.log(' MongoDB conectado correctamente');
    } catch (error) {
        console.error(' Error conectando a MongoDB:', error);
    }
}

module.exports = connectMongo;
