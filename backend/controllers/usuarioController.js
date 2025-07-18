const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const TokenRecuperacion = require('../models/token_recuperacion');

const getPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuario.id, {
      attributes: ['id', 'nombre', 'correo', 'rol', 'id_sucursal']
    });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el perfil', error: error.message });
  }
};

const updatePerfil = async (req, res) => {
  const { nombre, correo } = req.body;

  if (!nombre && !correo) {
    return res.status(400).json({ mensaje: 'Se requiere al menos un campo para actualizar' });
  }

  try {
    const usuario = await Usuario.findByPk(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ mensaje: 'Cuenta bloqueada' });
    }

    if (correo && correo !== usuario.correo) {
      const correoExistente = await Usuario.findOne({ where: { correo } });
      if (correoExistente) {
        return res.status(400).json({ mensaje: 'El correo ya está registrado' });
      }
    }

    await usuario.update({ nombre, correo });
    res.json({ id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el perfil', error: error.message });
  }
};

const getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'correo', 'rol', 'id_sucursal', 'activo']
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: error.message });
  }
};

const getUsuarioById = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await Usuario.findByPk(id, {
      attributes: ['id', 'nombre', 'correo', 'rol', 'id_sucursal', 'activo']
    });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el usuario', error: error.message });
  }
};

const createUsuario = async (req, res) => {
  const { nombre, correo, contrasena, rol, id_sucursal } = req.body;

  if (!nombre || !correo || !contrasena || !rol || !id_sucursal) {
    return res.status(400).json({ mensaje: 'Todos los campos son requeridos' });
  }

  if (!['administrador', 'operador'].includes(rol)) {
    return res.status(400).json({ mensaje: 'Rol inválido' });
  }

  try {
    const usuarioExistente = await Usuario.findOne({ where: { correo } });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);

    const usuario = await Usuario.create({
      nombre,
      correo,
      contrasena: hashedPassword,
      rol,
      id_sucursal,
      activo: true
    });

    res.status(201).json({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      id_sucursal: usuario.id_sucursal
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el usuario', error: error.message });
  }
};

const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, rol, id_sucursal } = req.body;

  if (!nombre && !correo && !rol && !id_sucursal) {
    return res.status(400).json({ mensaje: 'Se requiere al menos un campo para actualizar' });
  }

  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    if (correo && correo !== usuario.correo) {
      const correoExistente = await Usuario.findOne({ where: { correo } });
      if (correoExistente) {
        return res.status(400).json({ mensaje: 'El correo ya está registrado' });
      }
    }

    if (rol && !['administrador', 'operador'].includes(rol)) {
      return res.status(400).json({ mensaje: 'Rol inválido' });
    }

    await usuario.update({ nombre, correo, rol, id_sucursal });
    res.json({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      id_sucursal: usuario.id_sucursal,
      activo: usuario.activo
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el usuario', error: error.message });
  }
};

const resetUsuarioPassword = async (req, res) => {
  const { id } = req.params;
  const { nueva_contrasena } = req.body;

  if (!nueva_contrasena) {
    return res.status(400).json({ mensaje: 'La nueva contraseña es requerida' });
  }

  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const hashedPassword = await bcrypt.hash(nueva_contrasena, 10);
    await usuario.update({ contrasena: hashedPassword });

    res.json({ mensaje: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al restablecer la contraseña', error: error.message });
  }
};

const bloquearUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    if (!usuario.activo) {
      return res.status(400).json({ mensaje: 'El usuario ya está bloqueado' });
    }

    await usuario.update({ activo: false });
    res.json({ mensaje: 'Usuario bloqueado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al bloquear el usuario', error: error.message });
  }
};
//funcion para desbloquear Usuario
const desbloquearUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    if (usuario.activo) {
      return res.status(400).json({ mensaje: 'El usuario ya está activo' });
    }

    await usuario.update({ activo: true });
    res.json({ mensaje: 'Usuario desbloqueado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al desbloquear el usuario', error: error.message });
  }
};

const deleteUsuario = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await Usuario.findByPk(id);
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    if (!usuario.activo) {
      return res.status(400).json({ mensaje: 'El usuario ya está bloqueado' });
    }

    await usuario.update({ activo: false });
    res.json({ mensaje: 'Usuario suspendido exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al suspender el usuario', error: error.message });
  }
};

module.exports = {
  getPerfil,
  updatePerfil,
  getAllUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  resetUsuarioPassword,
  bloquearUsuario,
  desbloquearUsuario,
  deleteUsuario
};