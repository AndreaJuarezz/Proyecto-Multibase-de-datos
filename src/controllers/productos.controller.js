const { getPool } = require("../db/mysql");
const { getRedisClient } = require("../db/redis"); 

const CACHE_KEY = "productos_all"; 
const CACHE_EXPIRATION = 3600; // 1 hora en segundos


const CAMPOS_PERMITIDOS = ["nombre", "descripcion", "precio", "categoria_id", "stock"];

exports.obtenerProductos = async (req, res) => {
    try {
        const client = getRedisClient(); // Obtener el cliente Redis

        // 1. INTENTAR OBTENER DATOS DE LA CACHÉ
        const cachedProducts = await client.get(CACHE_KEY);

        if (cachedProducts) {
            console.log("CACHE HIT: Productos obtenidos desde Redis.");
            // Si están en caché, devolver los datos inmediatamente
            return res.json(JSON.parse(cachedProducts)); 
        }

        // 2. SI NO HAY CACHÉ (CACHE MISS), OBTENER DATOS DE MYSQL
        console.log("CACHE MISS: Obteniendo productos desde MySQL.");
        const pool = getPool();
        
        const sql = `
            SELECT p.id, p.nombre, p.descripcion, p.precio, p.categoria_id, c.nombre AS categoria_nombre,
                    p.stock, p.borrado, p.creado_en
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.borrado = 0
            ORDER BY p.creado_en DESC
        `;
        const [rows] = await pool.query(sql);

        // 3. GUARDAR RESULTADO EN LA CACHÉ ANTES DE RESPONDER
        await client.set(CACHE_KEY, JSON.stringify(rows), {
            EX: CACHE_EXPIRATION, // Establecer tiempo de expiración (1 hora)
        });

        res.json(rows);
    } catch (error) {
        console.error("Error al obtener productos:", error);
        res.status(500).json({ error: "Error al obtener productos" });
    }
};

exports.obtenerProductoPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = getPool();

        const sql = `
            SELECT p.id, p.nombre, p.descripcion, p.precio, p.categoria_id, c.nombre AS categoria_nombre,
                    p.stock, p.borrado, p.creado_en
            FROM productos p
            LEFT JOIN categorias c ON p.categoria_id = c.id
            WHERE p.id = ? AND p.borrado = 0
            LIMIT 1
        `;
        const [rows] = await pool.query(sql, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Error al obtener producto por id:", error);
        res.status(500).json({ error: "Error al obtener producto" });
    }
};

exports.crearProducto = async (req, res) => {
    try {
        const { nombre, descripcion = null, precio, categoria_id = null, stock = 0 } = req.body;

        // Validaciones básicas (omitiendo el resto por brevedad)
        if (!nombre || typeof nombre !== "string" || nombre.trim().length === 0) {
            return res.status(400).json({ error: "El nombre es obligatorio" });
        }
        if (precio === undefined || isNaN(Number(precio))) {
            return res.status(400).json({ error: "El precio es obligatorio y debe ser numérico" });
        }
        if (stock !== undefined && isNaN(Number(stock))) {
            return res.status(400).json({ error: "El stock debe ser numérico" });
        }

        const pool = getPool();

        // Opcional: verificar que la categoria exista si se envió categoria_id
        if (categoria_id !== null) {
            const [catRows] = await pool.query("SELECT id FROM categorias WHERE id = ? AND borrado = 0", [categoria_id]);
            if (catRows.length === 0) {
                return res.status(400).json({ error: "La categoría especificada no existe" });
            }
        }

        const [result] = await pool.query(
            "INSERT INTO productos (nombre, descripcion, precio, categoria_id, stock) VALUES (?, ?, ?, ?, ?)",
            [nombre, descripcion, Number(precio), categoria_id, Number(stock)]
        );

        const productoId = result.insertId;

        // Crear automáticamente el registro en inventario
        await pool.query(
            "INSERT INTO inventario (producto_id, cantidad) VALUES (?, ?)",
            [productoId, Number(stock)]
        );

        // INVALIDAR CACHÉ
        const client = getRedisClient();
        await client.del(CACHE_KEY); 

        res.status(201).json({
            id: productoId,
            nombre,
            descripcion,
            precio: Number(precio),
            categoria_id,
            stock: Number(stock)
        });
    } catch (error) {
        console.error("Error al crear producto:", error);
        res.status(500).json({ error: "Error al crear producto" });
    }
};

exports.actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = getPool();

        // Solo tomamos campos permitidos
        const updates = {};
        for (const key of CAMPOS_PERMITIDOS) {
            if (req.body[key] !== undefined) updates[key] = req.body[key];
        }

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ error: "No hay campos válidos para actualizar" });
        }

        // Si envían categoria_id, verificar existencia
        if (updates.categoria_id !== undefined && updates.categoria_id !== null) {
            const [catRows] = await pool.query("SELECT id FROM categorias WHERE id = ? AND borrado = 0", [updates.categoria_id]);
            if (catRows.length === 0) {
                return res.status(400).json({ error: "La categoría especificada no existe" });
            }
        }

        // Construir SET dinámico y valores
        const setParts = [];
        const values = [];
        for (const [k, v] of Object.entries(updates)) {
            setParts.push(`${k} = ?`);
            if (k === "precio" || k === "stock" || k === "categoria_id") {
                values.push(v !== null ? Number(v) : null);
            } else {
                values.push(v);
            }
        }
        values.push(id);

        const sql = `UPDATE productos SET ${setParts.join(", ")} WHERE id = ? AND borrado = 0`;
        const [result] = await pool.query(sql, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Producto no encontrado o ya eliminado" });
        }

        // INVALIDAR CACHÉ
        const client = getRedisClient();
        await client.del(CACHE_KEY); 

        res.json({ message: "Producto actualizado correctamente" });
    } catch (error) {
        console.error("Error al actualizar producto:", error);
        res.status(500).json({ error: "Error al actualizar producto" });
    }
};

exports.borrarProductoLogico = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = getPool();

        const [result] = await pool.query(
            "UPDATE productos SET borrado = 1 WHERE id = ? AND borrado = 0",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Producto no encontrado o ya eliminado" });
        }
        
        // INVALIDAR CACHÉ
        const client = getRedisClient();
        await client.del(CACHE_KEY); 

        res.json({ message: "Producto eliminado (borrado lógico)" });
    } catch (error) {
        console.error("Error al eliminar producto:", error);
        res.status(500).json({ error: "Error al eliminar producto" });
    }
};