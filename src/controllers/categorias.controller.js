const { getPool } = require("../db/mysql");

// Obtener todas las categorías
const getCategorias = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query("SELECT * FROM categorias WHERE eliminado = 0");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener categorías" });
  }
};

const getCategoria = async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      "SELECT * FROM categorias WHERE id = ? AND eliminado = 0",
      [req.params.id]
    );

    if (rows.length === 0)
      return res.status(404).json({ error: "Categoría no encontrada" });

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener categoría" });
  }
};

const createCategoria = async (req, res) => {
  try {
    const pool = getPool();
    const { nombre } = req.body;

    const [result] = await pool.query(
      "INSERT INTO categorias(nombre, eliminado) VALUES (?, 0)",
      [nombre]
    );

    res.json({ id: result.insertId, nombre });
  } catch (error) {
    res.status(500).json({ error: "Error al crear categoría" });
  }
};

const updateCategoria = async (req, res) => {
  try {
    const pool = getPool();
    const { nombre } = req.body;

    await pool.query(
      "UPDATE categorias SET nombre = ? WHERE id = ? AND eliminado = 0",
      [nombre, req.params.id]
    );

    res.json({ mensaje: "Categoría actualizada" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar categoría" });
  }
};

const deleteCategoria = async (req, res) => {
  try {
    const pool = getPool();

    await pool.query(
      "UPDATE categorias SET eliminado = 1 WHERE id = ?",
      [req.params.id]
    );

    res.json({ mensaje: "Categoría eliminada (borrado lógico)" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar categoría" });
  }
};

module.exports = {
  getCategorias,
  getCategoria,
  createCategoria,
  updateCategoria,
  deleteCategoria
};
