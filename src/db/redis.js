// src/db/redis.js
const { createClient } = require('redis');

const client = createClient({
    url: 'redis://localhost:6379'
});

client.on('connect', () => {
    console.log(' Redis conectado correctamente');
});

client.on('error', (err) => {
    console.error(' Error en Redis:', err);
});

async function connectRedis() {
    await client.connect();
    return client;
}

module.exports = connectRedis;
