const express = require('express');
const router  = express.Router();

const {
  createCita,
  getCitas,
  updateCita,
  cambiarEstado,
  deleteCita
} = require('../controllers/citas.controller');

const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const db             = require('../db');

// 🔒 OBTENER CITAS
router.get('/', authMiddleware, (req, res, next) => {
  if (req.user.rol === 'usuario') {
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
    next();
  }
}, getCitas);

// 🔒 CREAR CITA
router.post('/', authMiddleware, roleMiddleware('admin', 'tecnico', 'usuario'), createCita);

// ✅ CAMBIAR ESTADO — primero la ruta específica
router.put('/:id/estado', authMiddleware, roleMiddleware('admin', 'tecnico', 'usuario'), cambiarEstado);

// 🔒 ACTUALIZAR CITA — después la genérica
router.put('/:id', authMiddleware, roleMiddleware('admin', 'tecnico'), updateCita);

// 🔒 ELIMINAR CITA
router.delete('/:id', authMiddleware, roleMiddleware('admin', 'tecnico'), deleteCita);

module.exports = router;