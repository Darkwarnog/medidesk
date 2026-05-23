const express = require('express');
const router = express.Router();
 
const {
  register,
  login,
  createUsuario,
  deleteUsuario
} = require('../controllers/usuarios.controller');
 
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const db = require('../db');
 
// ✅ REGISTRO Y LOGIN — públicos
router.post('/register', register);
router.post('/login', login);
 
// 👨‍💼 OBTENER USUARIOS — admin y técnico
router.get('/', authMiddleware, roleMiddleware('admin', 'tecnico'), (req, res) => {
  db.query('SELECT id, nombre, email, rol FROM usuarios', (err, results) => {
    if (err) return res.status(500).json({ error: 'Error en la base de datos' });
    res.json({ ok: true, data: results });
  });
});
 
// 👨‍💼 CREAR USUARIO — solo admin
router.post('/', authMiddleware, roleMiddleware('admin'), createUsuario);
 
// 🗑️ ELIMINAR USUARIO — solo admin
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteUsuario);
 
module.exports = router;