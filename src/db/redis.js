// src/db/redis.js
const { createClient } = require('redis');

// Construimos la URL a partir de las variables de entorno
const REDIS_URL = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

// El cliente Redis debe ser global para ser accesible después de la conexión
let client; 

async function connectRedis() {
    if (!client) {
        client = createClient({
            url: REDIS_URL 
        });

        client.on('connect', () => {
            console.log(' Redis conectado correctamente');
        });

        client.on('error', (err) => {
            console.error(' Error en Redis:', err);
        });
        
        await client.connect();
    }
    return client;
}

// NUEVO: Función para obtener el cliente después de la conexión
function getRedisClient() {
    // Si el cliente no existe, devolver un error o null, 
    // pero para nuestro caso, asumimos que connectRedis ya se llamó.
    if (!client) {
        throw new Error("El cliente Redis no está inicializado. Llama a connectRedis primero.");
    }
    return client;
}

// Exportamos ambas funciones
module.exports = connectRedis;
module.exports.getRedisClient = getRedisClient; // <-- ¡ESTO FALTABA!