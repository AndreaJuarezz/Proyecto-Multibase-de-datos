// src/usuarios/usuario.controller.js
const Usuario = require('./usuario.model');

// Crear usuario
async function crearUsuario(req, res) {
  try {
    const usuario = new Usuario(req.body);
    const guardado = await usuario.save();
    res.status(201).json(guardado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Listar usuarios (solo no eliminados)
async function listarUsuarios(req, res) {
  const usuarios = await Usuario.find({ deleted: false });
  res.json(usuarios);
}

// Obtener usuario por ID
async function obtenerUsuarioPorId(req, res) {
  const { id } = req.params;
  try {
    const usuario = await Usuario.findById(id);
    if (!usuario || usuario.deleted) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Actualizar usuario
async function actualizarUsuario(req, res) {
  const { id } = req.params;
  try {
    const actualizado = await Usuario.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    res.json(actualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Borrado lógico
async function borrarUsuario(req, res) {
  const { id } = req.params;
  try {
    const borrado = await Usuario.findByIdAndUpdate(
      id,
      { deleted: true },
      { new: true }
    );
    res.json(borrado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = {
  crearUsuario,
  listarUsuarios,
  obtenerUsuarioPorId,
  actualizarUsuario,
  borrarUsuario
};
