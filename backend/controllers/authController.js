const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const TokenDenegado = require('../models/token_denegado');
const TokenRecuperacion = require('../models/token_recuperacion');
const nodemailer = require('nodemailer'); // Importamos nodemailer

// Cargar las variables de entorno
require('dotenv').config();

// --- Configuración de Nodemailer con Mailtrap ---
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false, // Usar 'true' si el puerto es 465 (SSL), 'false' para TLS (587 o 2525)
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

// --- Funciones del controlador ---

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
      usuario: { 
        id: usuario.id, 
        nombre: usuario.nombre, 
        rol: usuario.rol,
        id_sucursal:usuario.id_sucursal ? usuario.id_sucursal : null // Aseguramos que id_sucursal sea null si no existe
       }
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
      // Por seguridad, no revelamos si el usuario existe o no.
      // Siempre respondemos con un mensaje genérico.
      return res.status(200).json({ mensaje: 'Si el correo existe, se ha enviado un enlace de recuperación.' });
    }

    if (!usuario.activo) {
      return res.status(403).json({ mensaje: 'Cuenta bloqueada. Contacte al administrador.' });
    }

    // Generar el token de recuperación
    const resetToken = jwt.sign(
      { id_usuario: usuario.id },
      process.env.JWT_RESET_SECRET,
      { expiresIn: '15m' } // Token válido por 15 minutos
    );

    // Guardar el token de recuperación en la base de datos
    await TokenRecuperacion.create({
      id_usuario: usuario.id,
      token: resetToken,
      fecha_expiracion: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos en milisegundos
      usado: false
    });

    // Construir el enlace de recuperación para el frontend
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    // --- Enviar el correo electrónico con Nodemailer (usando Mailtrap) ---
    await transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to: usuario.correo,
      subject: 'Restablecimiento de Contraseña para tu Cuenta de Pastelería Dulce Tentación',
      html: `
        <p>Hola ${usuario.nombre},</p>
        <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
        <p>Haz clic en el siguiente enlace para establecer una nueva contraseña:</p>
        <p><a href="${resetUrl}">Restablecer mi Contraseña</a></p>
        <p>Este enlace es válido por 15 minutos. Si no solicitaste este cambio, por favor ignora este correo.</p>
        <p>Saludos,</p>
        <p>El equipo de Pastelería Dulce Tentación</p>
      `,
    });

    res.status(200).json({ mensaje: 'Si el correo existe, se ha enviado un enlace de recuperación.' });
  } catch (error) {
    console.error('Error al enviar correo de recuperación:', error);
    res.status(500).json({ mensaje: 'Error en el servidor al procesar la solicitud de recuperación.', error: error.message });
  }
};

const resetPassword = async (req, res) => {
  const { token, nueva_contrasena } = req.body;

  try {
    // Verificar el token JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_RESET_SECRET);
    } catch (jwtError) {
      return res.status(400).json({ mensaje: 'Token de recuperación inválido o manipulado.' });
    }

    // Buscar el token en la base de datos y verificar que no haya sido usado y no esté expirado
    const tokenRecuperacion = await TokenRecuperacion.findOne({
      where: { token, id_usuario: decoded.id_usuario, usado: false }
    });

    if (!tokenRecuperacion) {
      return res.status(400).json({ mensaje: 'Token de recuperación inválido o ya utilizado.' });
    }

    // Verificar si el token ha expirado
    if (new Date() > tokenRecuperacion.fecha_expiracion) {
      // Marcar el token como usado para evitar reusarlo incluso si se intenta de nuevo con el mismo token expirado
      await tokenRecuperacion.update({ usado: true });
      return res.status(400).json({ mensaje: 'El token de recuperación ha expirado.' });
    }

    // Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(nueva_contrasena, 10);

    // Actualizar la contraseña del usuario
    await Usuario.update(
      { contrasena: hashedPassword },
      { where: { id: tokenRecuperacion.id_usuario } }
    );

    // Marcar el token de recuperación como usado
    await tokenRecuperacion.update({ usado: true });

    res.json({ mensaje: 'Contraseña restablecida exitosamente.' });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ mensaje: 'Error en el servidor al restablecer la contraseña.', error: error.message });
  }
};

module.exports = { login, register, logout, forgotPassword, resetPassword };