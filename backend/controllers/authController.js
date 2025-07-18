const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const TokenDenegado = require('../models/token_denegado');
const TokenRecuperacion = require('../models/token_recuperacion');

const login = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ mensaje: 'Cuenta bloqueada' });
    }

    const esValida = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!esValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, id_sucursal: usuario.id_sucursal },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

const register = async (req, res) => {
  const { nombre, correo, contrasena, rol, id_sucursal } = req.body;

  try {
    if (!['administrador', 'operador'].includes(rol)) {
      return res.status(400).json({ mensaje: 'Rol inválido' });
    }

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
      mensaje: 'Usuario registrado exitosamente',
      usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

const logout = async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(400).json({ mensaje: 'No se proporcionó token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await TokenDenegado.create({
      token,
      fecha_expiracion: new Date(decoded.exp * 1000)
    });

    res.json({ mensaje: 'Cierre de sesión exitoso' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { correo } = req.body;

  try {
    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ mensaje: 'Cuenta bloqueada' });
    }

    const resetToken = jwt.sign(
      { id_usuario: usuario.id },
      process.env.JWT_RESET_SECRET,
      { expiresIn: '15m' }
    );

    await TokenRecuperacion.create({
      id_usuario: usuario.id,
      token: resetToken,
      fecha_expiracion: new Date(Date.now() + 15 * 60 * 1000)
    });

    console.log(`Enlace de recuperación para ${correo}: http://localhost:3000/auth/reset?token=${resetToken}`);

    res.json({ mensaje: 'Enlace de recuperación enviado (simulado en consola)' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, nueva_contrasena } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);

    const tokenRecuperacion = await TokenRecuperacion.findOne({
      where: { token, id_usuario: decoded.id_usuario, usado: false }
    });

    if (!tokenRecuperacion || tokenRecuperacion.fecha_expiracion < new Date()) {
      return res.status(400).json({ mensaje: 'Token inválido o expirado' });
    }

    const hashedPassword = await bcrypt.hash(nueva_contrasena, 10);

    await Usuario.update(
      { contrasena: hashedPassword },
      { where: { id: tokenRecuperacion.id_usuario } }
    );

    await tokenRecuperacion.update({ usado: true });

    res.json({ mensaje: 'Contraseña restablecida exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

module.exports = { login, register, logout, forgotPassword, resetPassword };