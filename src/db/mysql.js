// src/db/mysql.js
const mysql = require('mysql2/promise');

let pool;

async function connectMySQL() {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.MYSQL_HOST || 'localhost',
            user: process.env.MYSQL_USER || 'root',
            password: process.env.MYSQL_PASSWORD || 'root123',
            database: process.env.MYSQL_DB || 'ecommerce',
            port: process.env.MYSQL_PORT || 3306
        });

        console.log(' MySQL conectado correctamente');
    }
    return pool;
}

function getPool() {
    return pool;
}

module.exports = connectMySQL;
module.exports.getPool = getPool;
