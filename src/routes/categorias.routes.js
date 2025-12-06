const express = require("express");
const router = express.Router();
const { getPool } = require("../db/mysql");

router.get("/", async (req, res) => {
    try {
        const pool = getPool();  // ← AQUÍ ESTÁ EL CAMBIO IMPORTANTE

        const [rows] = await pool.query("SELECT * FROM categorias");
        res.json(rows);

    } catch (error) {
        console.error("Error al obtener categorías:", error);
        res.status(500).json({ error: "Error al obtener categorías" });
    }
});

module.exports = router;
