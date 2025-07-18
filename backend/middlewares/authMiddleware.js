const jwt = require('jsonwebtoken');
const TokenDenegado = require('../models/token_denegado');

const authMiddleware = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'No se proporcionó token' });
  }

  try {
    // Verificar si el token está en la lista de denegados
    const tokenDenegado = await TokenDenegado.findOne({ where: { token } });
    if (tokenDenegado) {
      return res.status(401).json({ mensaje: 'Token inválido (sesión cerrada)' });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ mensaje: 'Token inválido', error: error.message });
  }
};

const restrictTo = (...rolesPermitidos) => {
  return (req, res, next) => {
    
    // Validar que el usuario esté autenticado
    if (!req.usuario) {
      return res.status(401).json({ mensaje: 'Usuario no autenticado' });
    }
    
    // Validar que el rol exista
    const rolUsuario = req.usuario.rol;
    if (!rolUsuario) {
      return res.status(400).json({ mensaje: 'Rol de usuario no especificado' });
    }

    // Verificar si el rol está permitido
    if (!rolesPermitidos.includes(rolUsuario)) {
      // Puedes habilitar este logger si deseas auditoría
      // console.warn(`Acceso denegado para usuario con rol '${rolUsuario}' a ruta ${req.originalUrl}`);
      return res.status(403).json({
        mensaje: `Acceso denegado: se requiere uno de los siguientes roles: ${rolesPermitidos.join(', ')}`,
      });
      
    }
    

    // Acceso permitido
    next();
  };
};

module.exports = { restrictTo };


module.exports = { authMiddleware, restrictTo };