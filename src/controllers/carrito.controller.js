const { getPool } = require('../db/mysql');

// Crea (o reutiliza) un carrito para el usuario
async function ensureCarrito(pool, usuarioId) {
  // Busca carrito no borrado
  const [rows] = await pool.query(
    'SELECT id FROM carrito WHERE usuario_id = ? AND borrado = 0 LIMIT 1',
    [usuarioId]
  );
  if (rows.length > 0) return rows[0].id;

  const [result] = await pool.query(
    'INSERT INTO carrito (usuario_id, borrado) VALUES (?, 0)',
    [usuarioId]
  );
  return result.insertId;
}

// GET /api/carrito/:usuarioId
exports.obtenerCarrito = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const pool = getPool();

    // Asegura carrito y trae items
    const carritoId = await ensureCarrito(pool, usuarioId);

    const [items] = await pool.query(
      `SELECT ci.id, ci.producto_id, ci.cantidad, p.nombre, p.precio
       FROM carrito_items ci
       JOIN productos p ON ci.producto_id = p.id
       WHERE ci.carrito_id = ? AND ci.borrado = 0`,
      [carritoId]
    );

    res.json({ carrito_id: carritoId, usuario_id: usuarioId, items });
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({ error: 'Error al obtener carrito' });
  }
};

// POST /api/carrito/:usuarioId/items
exports.agregarItem = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const { producto_id, cantidad } = req.body;

    if (!producto_id || !cantidad || Number(cantidad) <= 0) {
      return res.status(400).json({ error: 'producto_id y cantidad (>0) son obligatorios' });
    }

    const pool = getPool();
    const carritoId = await ensureCarrito(pool, usuarioId);

    // Verifica producto existe, no borrado y trae stock
    const [prodRows] = await pool.query(
      'SELECT id, stock FROM productos WHERE id = ? AND borrado = 0',
      [producto_id]
    );
    if (prodRows.length === 0) {
      return res.status(400).json({ error: 'El producto no existe o está borrado' });
    }

    const stockDisponible = Number(prodRows[0].stock || 0);

    // Si ya existe item, suma y valida stock
    const [itemRows] = await pool.query(
      'SELECT id, cantidad FROM carrito_items WHERE carrito_id = ? AND producto_id = ? AND borrado = 0',
      [carritoId, producto_id]
    );

    if (itemRows.length > 0) {
      const nuevo = itemRows[0].cantidad + Number(cantidad);
      if (nuevo > stockDisponible) {
        return res.status(400).json({ error: `Stock insuficiente. Disponible: ${stockDisponible}, solicitado: ${nuevo}` });
      }

      await pool.query(
        'UPDATE carrito_items SET cantidad = ? WHERE id = ?',
        [nuevo, itemRows[0].id]
      );
      return res.status(200).json({ mensaje: 'Cantidad actualizada', cantidad: nuevo });
    }

    // Validar stock para nuevo item
    if (Number(cantidad) > stockDisponible) {
      return res.status(400).json({ error: `Stock insuficiente. Disponible: ${stockDisponible}, solicitado: ${Number(cantidad)}` });
    }

    // Inserta nuevo item
    await pool.query(
      'INSERT INTO carrito_items (carrito_id, producto_id, cantidad, borrado) VALUES (?, ?, ?, 0)',
      [carritoId, producto_id, Number(cantidad)]
    );

    res.status(201).json({ mensaje: 'Producto agregado al carrito' });
  } catch (error) {
    console.error('Error al agregar item al carrito:', error);
    res.status(500).json({ error: 'Error al agregar item al carrito' });
  }
};

// DELETE /api/carrito/:usuarioId/items/:productoId
exports.eliminarItem = async (req, res) => {
  try {
    const { usuarioId, productoId } = req.params;
    const pool = getPool();
    const carritoId = await ensureCarrito(pool, usuarioId);

    const [result] = await pool.query(
      'UPDATE carrito_items SET borrado = 1 WHERE carrito_id = ? AND producto_id = ? AND borrado = 0',
      [carritoId, productoId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Producto no encontrado en el carrito' });
    }

    res.json({ mensaje: 'Producto eliminado del carrito' });
  } catch (error) {
    console.error('Error al eliminar item del carrito:', error);
    res.status(500).json({ error: 'Error al eliminar item del carrito' });
  }
};

// DELETE /api/carrito/:usuarioId
exports.vaciarCarrito = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const pool = getPool();
    const carritoId = await ensureCarrito(pool, usuarioId);

    await pool.query(
      'UPDATE carrito_items SET borrado = 1 WHERE carrito_id = ? AND borrado = 0',
      [carritoId]
    );

    res.json({ mensaje: 'Carrito vaciado' });
  } catch (error) {
    console.error('Error al vaciar carrito:', error);
    res.status(500).json({ error: 'Error al vaciar carrito' });
  }
};
