const express = require("express");
const router = express.Router();
const { getPool } = require("../db/mysql");
const { getRedisClient } = require("../db/redis");


// GET → Obtener todas (solo activas)
router.get("/", async (req, res) => {
    try {
        const client = getRedisClient();
        const cacheKey = "categorias:list";

        const cached = await client.get(cacheKey);
        if (cached) {
            return res.json(JSON.parse(cached));
        }

        const pool = getPool();
        const [rows] = await pool.query(
            "SELECT * FROM categorias WHERE borrado = 0"
        );

        // Cachear por 120 segundos
        await client.set(cacheKey, JSON.stringify(rows), { EX: 120 });

        res.json(rows);
    } catch (error) {
        console.error("Error al obtener categorías:", error);
        res.status(500).json({ error: "Error al obtener categorías" });
    }
});


// GET → Obtener categoría por ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const client = getRedisClient();
        const cacheKey = `categorias:id:${id}`;

        const cached = await client.get(cacheKey);
        if (cached) {
            const data = JSON.parse(cached);
            return res.json(data);
        }

        const pool = getPool();
        const [rows] = await pool.query(
            "SELECT * FROM categorias WHERE id = ? AND borrado = 0",
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }

        await client.set(cacheKey, JSON.stringify(rows[0]), { EX: 300 });
        res.json(rows[0]);
    } catch (error) {
        console.error("Error al obtener categoría:", error);
        res.status(500).json({ error: "Error al obtener categoría" });
    }
});


// POST → Crear una nueva categoría
router.post("/", async (req, res) => {
    try {
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        const pool = getPool();

        const [result] = await pool.query(
            "INSERT INTO categorias (nombre) VALUES (?)",
            [nombre]
        );

        // Invalidar cache de lista
        try {
            const client = getRedisClient();
            await client.del("categorias:list");
        } catch (_) {}

        res.json({
            id: result.insertId,
            nombre,
            borrado: 0
        });

    } catch (error) {
        console.error("Error al crear categoría:", error);
        res.status(500).json({ error: "Error al crear categoría" });
    }
});


// PATCH → Actualizar categoría
router.patch("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre } = req.body;

        if (!nombre) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }

        const pool = getPool();

        const [result] = await pool.query(
            "UPDATE categorias SET nombre = ? WHERE id = ? AND borrado = 0",
            [nombre, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Categoría no encontrada" });
        }

        // Invalidar caches relacionados
        try {
            const client = getRedisClient();
            await client.del("categorias:list");
            await client.del(`categorias:id:${id}`);
        } catch (_) {}

        res.json({ message: "Categoría actualizada correctamente" });

    } catch (error) {
        console.error("Error al actualizar categoría:", error);
        res.status(500).json({ error: "Error al actualizar categoría" });
    }
});

// DELETE → Borrado lógico
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const pool = getPool();

        const [result] = await pool.query(
            "UPDATE categorias SET borrado = 1 WHERE id = ? AND borrado = 0",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Categoría no encontrada o ya eliminada" });
        }

        // Invalidar caches relacionados
        try {
            const client = getRedisClient();
            await client.del("categorias:list");
            await client.del(`categorias:id:${id}`);
        } catch (_) {}

        res.json({ message: "Categoría eliminada (borrado lógico)" });

    } catch (error) {
        console.error("Error al eliminar categoría:", error);
        res.status(500).json({ error: "Error al eliminar categoría" });
    }
});


module.exports = router;
