// src/usuarios/usuario.routes.js
const express = require('express');
const router = express.Router();
const controller = require('./usuario.controller');

router.post('/', controller.crearUsuario);
router.get('/', controller.listarUsuarios);
router.patch('/:id', controller.actualizarUsuario);
router.delete('/:id', controller.borrarUsuario);

module.exports = router;
