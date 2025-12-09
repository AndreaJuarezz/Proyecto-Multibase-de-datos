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
        const [rows] = await pool.query('SELECT * FROM inventario WHERE activo = 1');
        
        res.json({ mensaje: "Lista de existencias de inventario activas", data: rows });

    } catch (error) {
        console.error("Error al obtener existencias:", error);
        res.status(500).json({ 
            error: "Error interno del servidor al obtener inventario",
            detalle: error.message
        });
    }
};

/**
 * Obtiene el stock de un producto específico.
 * GET /api/inventario/:productoId
 */
exports.getInventarioByProducto = async (req, res) => {
    const { productoId } = req.params;

    try {
        const pool = getPool();
        if (!pool) return res.status(500).json({ error: "Error de conexión a la base de datos." });

        const [rows] = await pool.query('SELECT * FROM inventario WHERE producto_id = ? AND activo = 1', [productoId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Inventario no encontrado para este producto." });
        }

        res.json({ mensaje: "Inventario encontrado", data: rows[0] });

    } catch (error) {
        console.error("Error al obtener inventario:", error);
        res.status(500).json({ 
            error: "Error interno del servidor",
            detalle: error.message
        });
    }
};

/**
 * Ajusta las existencias de un producto (INSERT si no existe, UPDATE si existe).
 * POST /api/inventario/ajustar
 */
exports.ajustarInventario = async (req, res) => {
    const { producto_id, cantidad, ubicacion } = req.body;
    
    if (!producto_id || cantidad === undefined) {
        return res.status(400).json({ error: "Faltan producto_id o cantidad en la petición." });
    }

    try {
        const pool = getPool();
        if (!pool) return res.status(500).json({ error: "Error de conexión a la base de datos." });
        
        // 1. Intenta actualizar (UPDATE)
        const updateSql = 'UPDATE inventario SET cantidad = cantidad + ?, ubicacion = IFNULL(?, ubicacion), actualizado_en = CURRENT_TIMESTAMP, activo = 1 WHERE producto_id = ?';
        const [result] = await pool.query(updateSql, [cantidad, ubicacion, producto_id]);

        if (result.affectedRows === 0) {
            // 2. Si no existe, inserta (INSERT)
            const insertSql = 'INSERT INTO inventario (producto_id, cantidad, ubicacion) VALUES (?, ?, ?)';
            await pool.query(insertSql, [producto_id, cantidad, ubicacion]);
            res.status(201).json({ mensaje: "Producto insertado en inventario con éxito." });
        } else {
            res.json({ mensaje: "Existencias de producto ajustadas con éxito." });
        }
    } catch (error) {
        console.error("Error al ajustar inventario:", error); 
        res.status(500).json({ 
            error: "Error al procesar el ajuste de inventario.",
            detalle: error.message
        });
    }
};

/**
 * Actualiza un campo específico del inventario (PATCH).
 * PATCH /api/inventario/:productoId
 */
exports.updateInventario = async (req, res) => {
    const { productoId } = req.params;
    const { ubicacion } = req.body; 

    if (!ubicacion) {
        return res.status(400).json({ error: "Debe proporcionar el campo 'ubicacion' para actualizar." });
    }

    try {
        const pool = getPool();
        if (!pool) return res.status(500).json({ error: "Error de conexión a la base de datos." });

        const sql = 'UPDATE inventario SET ubicacion = ?, actualizado_en = CURRENT_TIMESTAMP WHERE producto_id = ? AND activo = 1';
        const [result] = await pool.query(sql, [ubicacion, productoId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Registro de inventario no encontrado o ya eliminado." });
        }

        res.json({ mensaje: `Ubicación del producto ID ${productoId} actualizada.` });
    } catch (error) {
        console.error("Error al actualizar inventario:", error);
        res.status(500).json({ error: "Error al actualizar la ubicación de inventario." });
    }
};

/**
 * Realiza el borrado lógico de una existencia de inventario.
 * DELETE /api/inventario/:productoId
 */
exports.deleteInventario = async (req, res) => {
    const { productoId } = req.params; 
    
    try {
        const pool = getPool();
        if (!pool) return res.status(500).json({ error: "Error de conexión a la base de datos." });

        // Borrado Lógico: Establece 'activo' a 0
        const sql = 'UPDATE inventario SET activo = 0, actualizado_en = CURRENT_TIMESTAMP WHERE producto_id = ?';
        const [result] = await pool.query(sql, [productoId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Registro de inventario no encontrado o ya inactivo." });
        }
        
        res.json({ mensaje: `Existencia de producto ID ${productoId} marcada como inactiva (Borrado Lógico).` });

    } catch (error) {
        console.error("Error al eliminar inventario:", error);
        res.status(500).json({ error: "Error interno al realizar el borrado lógico." });
    }
};