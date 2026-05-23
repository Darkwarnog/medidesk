const express = require('express');
const router  = express.Router();

const {
  createCita,
  getCitas,
  updateCita,
  cambiarEstado,
  deleteCita          // ← ahora importado del controller
} = require('../controllers/citas.controller');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const db             = require('../db');

// 🔒 OBTENER CITAS
// Admin y técnico ven todas; usuario solo las suyas
router.get('/', authMiddleware, (req, res, next) => {
  if (req.user.rol === 'usuario') {
    // Solo sus propias citas — con soporte para paciente_nombre libre
    const query = `
      SELECT
        citas.id,
        COALESCE(usuarios.nombre, citas.paciente_nombre, 'Sin nombre') AS paciente,
        citas.fecha,
        citas.hora,
        citas.motivo,
        citas.estado,
        citas.prioridad,
        citas.categoria
      FROM citas
      LEFT JOIN usuarios ON citas.paciente_id = usuarios.id
      WHERE citas.paciente_id = ?
      ORDER BY citas.id DESC
    `;
    db.query(query, [req.user.id], (err, results) => {
      if (err) return res.status(500).json({ error: 'Error al obtener citas' });
      res.json({ ok: true, data: results });
    });
  } else {
    next(); // admin y técnico pasan al getCitas del controller
  }
}, getCitas);

// 🔒 CREAR CITA — admin, técnico y usuario
router.post('/', authMiddleware, roleMiddleware('admin', 'tecnico', 'usuario'), createCita);

// 🔒 ACTUALIZAR CITA — admin y técnico
router.put('/:id', authMiddleware, roleMiddleware('admin', 'tecnico'), updateCita);

// 🔒 CAMBIAR ESTADO — admin, técnico y usuario
router.put('/:id/estado', authMiddleware, roleMiddleware('admin', 'tecnico', 'usuario'), cambiarEstado);

// 🔒 ELIMINAR CITA — solo admin y técnico (usando deleteCita del controller)
router.delete('/:id', authMiddleware, roleMiddleware('admin', 'tecnico'), deleteCita);

module.exports = router;