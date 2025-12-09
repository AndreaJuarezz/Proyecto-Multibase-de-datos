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
  actualizarUsuario,
  borrarUsuario
};
