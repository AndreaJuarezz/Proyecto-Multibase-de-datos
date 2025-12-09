// src/controllers/pedidos.controller.js

// Importamos ÚNICAMENTE la función getPool (no el pool en sí)
const getPool = require('../db/mysql').getPool;

/**
 * Obtiene todos los pedidos registrados que no están eliminados.
 * GET /api/pedidos
 */
exports.getAllPedidos = async (req, res) => {
    try {
        // 🔑 OBTENER EL POOL AQUÍ
        const pool = getPool();
        if (!pool) return res.status(500).json({ error: "Error de conexión a la base de datos." });

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
 * Crea un nuevo pedido en la base de datos (VERSIÓN CORREGIDA FINAL).
 * POST /api/pedidos
 */
exports.createPedido = async (req, res) => {
    const { id_usuario, estado } = req.body;

    if (!id_usuario) {
        return res.status(400).json({ error: "Falta id_usuario." });
    }

    const estadoFinal = estado || 'pendiente';

    let conn;
    try {
        const pool = getPool();
        if (!pool) return res.status(500).json({ error: "Error de conexión a la base de datos." });

        conn = await pool.getConnection();
        await conn.beginTransaction();

        // Obtener carrito del usuario
        const [carritoRows] = await conn.query(
            'SELECT id FROM carrito WHERE usuario_id = ? AND borrado = 0 LIMIT 1',
            [id_usuario]
        );
        if (carritoRows.length === 0) {
            await conn.rollback();
            conn.release();
            return res.status(400).json({ error: 'El usuario no tiene carrito activo.' });
        }
        const carritoId = carritoRows[0].id;

        // Traer items del carrito con stock actual
        const [items] = await conn.query(
            `SELECT ci.producto_id, ci.cantidad, p.precio, p.stock
             FROM carrito_items ci
             JOIN productos p ON ci.producto_id = p.id
             WHERE ci.carrito_id = ? AND ci.borrado = 0`,
            [carritoId]
        );

        if (items.length === 0) {
            await conn.rollback();
            conn.release();
            return res.status(400).json({ error: 'El carrito está vacío.' });
        }

        // Validar stock
        for (const item of items) {
            if (Number(item.stock || 0) < Number(item.cantidad)) {
                await conn.rollback();
                conn.release();
                return res.status(400).json({
                    error: `Stock insuficiente para producto ${item.producto_id}. Disponible: ${item.stock}, solicitado: ${item.cantidad}`
                });
            }
        }

        // Calcular total
        const totalCalculado = items.reduce((acc, it) => acc + Number(it.precio) * Number(it.cantidad), 0);

        // Insertar pedido
        const [pedidoRes] = await conn.query(
            'INSERT INTO Pedidos (id_usuario, fecha_pedido, estado, total) VALUES (?, NOW(), ?, ?)',
            [id_usuario, estadoFinal, totalCalculado]
        );

        // Descontar stock de cada producto
        for (const item of items) {
            const [upd] = await conn.query(
                'UPDATE productos SET stock = stock - ? WHERE id = ? AND borrado = 0 AND stock >= ?',
                [item.cantidad, item.producto_id, item.cantidad]
            );
            if (upd.affectedRows === 0) {
                await conn.rollback();
                conn.release();
                return res.status(400).json({
                    error: `No se pudo descontar stock para producto ${item.producto_id}`
                });
            }
        }

        // Vaciar carrito después de crear pedido
        await conn.query('UPDATE carrito_items SET borrado = 1 WHERE carrito_id = ?', [carritoId]);

        await conn.commit();
        conn.release();

        res.status(201).json({
            mensaje: "Pedido creado con éxito.",
            id_pedido: pedidoRes.insertId,
            total: totalCalculado
        });

    } catch (error) {
        if (conn) {
            try { await conn.rollback(); } catch (_) {}
            conn.release();
        }
        console.error("Error al crear pedido con validación de stock:", error);
        res.status(500).json({ 
            error: "Error interno al crear el pedido.",
            detalle: error.message
        });
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
        // 🔑 OBTENER EL POOL AQUÍ
        const pool = getPool();
        if (!pool) return res.status(500).json({ error: "Error de conexión a la base de datos." });

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
        // 🔑 OBTENER EL POOL AQUÍ
        const pool = getPool();
        if (!pool) return res.status(500).json({ error: "Error de conexión a la base de datos." });

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