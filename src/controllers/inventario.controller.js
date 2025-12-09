// src/controllers/inventario.controller.js

const getPool = require('../db/mysql').getPool; 

/**
 * Obtiene todas las existencias de inventario activas.
 * GET /api/inventario
 */
exports.getExistencias = async (req, res) => {
    try {
        const pool = getPool();
        if (!pool) return res.status(500).json({ error: "Error de conexión a la base de datos." });

        // Solo selecciona registros donde activo sea 1 (no borrados lógicamente)
        const [rows] = await pool.query('SELECT * FROM Inventario WHERE activo = 1');
        
        res.json({ mensaje: "Lista de existencias de Inventario activas", data: rows });

    } catch (error) {
        console.error("Error al obtener existencias:", error);
        res.status(500).json({ 
            error: "Error interno del servidor al obtener inventario",
            detalle: error.message
        });
    }
};

/**
 * Ajusta las existencias de un producto (INSERT si no existe, UPDATE si existe).
 * POST /api/inventario/ajustar
 */
exports.ajustarInventario = async (req, res) => {
    const { id_producto, cantidad, ubicacion } = req.body;
    
    if (!id_producto || cantidad === undefined) {
        return res.status(400).json({ error: "Faltan id_producto o cantidad en la petición." });
    }

    try {
        const pool = getPool();
        if (!pool) return res.status(500).json({ error: "Error de conexión a la base de datos." });
        
        // 1. Intenta actualizar (UPDATE)
        const updateSql = 'UPDATE Inventario SET cantidad_existencia = cantidad_existencia + ?, ubicacion = IFNULL(?, ubicacion), ultima_actualizacion = CURRENT_TIMESTAMP, activo = 1 WHERE id_producto = ?';
        const [result] = await pool.query(updateSql, [cantidad, ubicacion, id_producto]);

        if (result.affectedRows === 0) {
            // 2. Si no existe, inserta (INSERT)
            const insertSql = 'INSERT INTO Inventario (id_producto, cantidad_existencia, ubicacion) VALUES (?, ?, ?)';
            await pool.query(insertSql, [id_producto, cantidad, ubicacion]);
            res.status(201).json({ mensaje: "Producto insertado en Inventario con éxito." });
        } else {
            res.json({ mensaje: "Existencias de producto ajustadas con éxito." });
        }
    } catch (error) {
        // CAMBIO CRUCIAL: Mostrar error exacto de MySQL
        console.error("Error al ajustar inventario (FALLO SQL):", error); 
        res.status(500).json({ 
            error: "Error al procesar el ajuste de inventario.",
            detalle: error.message // <-- ENVIAREMOS EL ERROR SQL DE VUELTA
        });
    }
};

/**
 * Actualiza un campo específico del inventario (PATCH).
 * PATCH /api/inventario/:id_producto
 */
exports.updateInventario = async (req, res) => {
    const id_producto = req.params.id_producto;
    const { ubicacion } = req.body; 

    if (!ubicacion) {
        return res.status(400).json({ error: "Debe proporcionar el campo 'ubicacion' para actualizar." });
    }

    try {
        const pool = getPool();
        if (!pool) return res.status(500).json({ error: "Error de conexión a la base de datos." });

        const sql = 'UPDATE Inventario SET ubicacion = ?, ultima_actualizacion = CURRENT_TIMESTAMP WHERE id_producto = ? AND activo = 1';
        const [result] = await pool.query(sql, [ubicacion, id_producto]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Registro de inventario no encontrado o ya eliminado." });
        }

        res.json({ mensaje: `Ubicación del producto ID ${id_producto} actualizada.` });
    } catch (error) {
        console.error("Error al actualizar inventario:", error);
        res.status(500).json({ error: "Error al actualizar la ubicación de inventario." });
    }
};

/**
 * Realiza el borrado lógico de una existencia de inventario.
 * DELETE /api/inventario/:id_producto
 */
exports.deleteInventario = async (req, res) => {
    const id_producto = req.params.id_producto; 
    
    try {
        const pool = getPool();
        if (!pool) return res.status(500).json({ error: "Error de conexión a la base de datos." });

        // Borrado Lógico: Establece 'activo' a 0
        const sql = 'UPDATE Inventario SET activo = 0, ultima_actualizacion = CURRENT_TIMESTAMP WHERE id_producto = ?';
        const [result] = await pool.query(sql, [id_producto]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Registro de inventario no encontrado o ya inactivo." });
        }
        
        res.json({ mensaje: `Existencia de producto ID ${id_producto} marcada como inactiva (Borrado Lógico).` });

    } catch (error) {
        console.error("Error al eliminar inventario:", error);
        res.status(500).json({ error: "Error interno al realizar el borrado lógico." });
    }
};