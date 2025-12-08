// src/controllers/pedidos.controller.js
const pool = require('../db/mysql').getPool(); 

/**
 * Obtiene todos los pedidos registrados que no están eliminados.
 * GET /api/pedidos
 */
exports.getAllPedidos = async (req, res) => {
    try {
        // Solo selecciona pedidos donde 'eliminado' sea 0
        const [rows] = await pool.query('SELECT * FROM Pedidos WHERE eliminado = 0');
        
        res.json({ mensaje: "Lista de Pedidos activos", data: rows });

    } catch (error) {
        console.error("Error al obtener pedidos:", error);
        res.status(500).json({ 
            error: "Error interno del servidor al obtener pedidos",
            detalle: error.message
        });
    }
};

/**
 * Crea un nuevo pedido en la base de datos.
 * POST /api/pedidos
 */
exports.createPedido = async (req, res) => {
    const { id_usuario, estado, total } = req.body;
    
    if (!id_usuario || !estado || total === undefined) {
        return res.status(400).json({ error: "Faltan campos obligatorios (id_usuario, estado, total)." });
    }

    try {
        const fecha_pedido = new Date();
        
        // Consulta INSERT para agregar el nuevo pedido
        const sql = 'INSERT INTO Pedidos (id_usuario, fecha_pedido, estado, total) VALUES (?, ?, ?, ?)';
        const [result] = await pool.query(sql, [id_usuario, fecha_pedido, estado, total]);

        // La inserción fue exitosa
        res.status(201).json({ 
            mensaje: "Pedido creado con éxito.",
            id_pedido: result.insertId // Obtiene el ID generado por MySQL
        });

    } catch (error) {
        console.error("Error al crear pedido:", error);
        res.status(500).json({ error: "Error interno al crear el pedido." });
    }
};

/**
 * Actualiza el estado de un pedido (PATCH).
 * PATCH /api/pedidos/:id_pedido
 */
exports.updatePedido = async (req, res) => {
    const id_pedido = req.params.id_pedido;
    const { estado } = req.body; 

    if (!estado) {
        return res.status(400).json({ error: "Debe proporcionar el campo 'estado' para actualizar." });
    }

    try {
        const sql = 'UPDATE Pedidos SET estado = ? WHERE id_pedido = ? AND eliminado = 0';
        const [result] = await pool.query(sql, [estado, id_pedido]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Pedido no encontrado o ya eliminado." });
        }

        res.json({ mensaje: `Estado del Pedido ID ${id_pedido} actualizado a: ${estado}.` });
    } catch (error) {
        console.error("Error al actualizar pedido:", error);
        res.status(500).json({ error: "Error al actualizar el estado del pedido." });
    }
};

/**
 * Realiza el borrado lógico de un pedido.
 * DELETE /api/pedidos/:id_pedido
 */
exports.deletePedido = async (req, res) => {
    const id_pedido = req.params.id_pedido;
    
    try {
        // Borrado Lógico: Establece 'eliminado' a 1
        const sql = 'UPDATE Pedidos SET eliminado = 1 WHERE id_pedido = ?';
        const [result] = await pool.query(sql, [id_pedido]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Pedido no encontrado o ya eliminado." });
        }
        
        res.json({ mensaje: `Pedido ID ${id_pedido} marcado como eliminado (Borrado Lógico).` });

    } catch (error) {
        console.error("Error al eliminar pedido:", error);
        res.status(500).json({ error: "Error interno al realizar el borrado lógico." });
    }
};