const jwt = require('jsonwebtoken');

const SECRET = 'secreto123'; // 🔥 igual que en controller

const authMiddleware = (req, res, next) => {

  try {

    // 🔥 OBTENER HEADER
    const authHeader = req.headers['authorization'];

    if (!authHeader) {
      return res.status(401).json({ error: 'Token requerido' });
    }

    // 🔥 FORMATO: "Bearer TOKEN"
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token mal formado' });
    }

    // 🔥 VERIFICAR TOKEN
    const decoded = jwt.verify(token, SECRET);

    // 🔥 GUARDAR DATOS DEL USUARIO
    req.user = decoded;

    next();

  } catch (error) {

    console.error(error);

    return res.status(403).json({ error: 'Token inválido o expirado' });
  }

};

module.exports = authMiddleware;