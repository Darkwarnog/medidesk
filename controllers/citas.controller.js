const db = require('../db');

// ✅ CREAR CITA
const createCita = (req, res) => {
  try {
    const {
      paciente_id,
      paciente_nombre,
      fecha,
      hora,
      motivo,
      estado,
      prioridad,
      categoria
    } = req.body;

    const rolUsuario = req.user.rol;
    const idUsuario  = req.user.id;

    // 🔒 Si es usuario normal, forzar su propio id como paciente_id
    // ignorando lo que venga del body
    let finalPacienteId     = paciente_id     || null;
    let finalPacienteNombre = paciente_nombre || null;

    if (rolUsuario === 'usuario') {
      finalPacienteId     = idUsuario;
      finalPacienteNombre = null;
    }

    // Validación: necesita al menos uno de los dos
    if (!finalPacienteId && !finalPacienteNombre) {
      return res.status(400).json({ error: 'Se requiere paciente_id o paciente_nombre' });
    }

    const query = `
      INSERT INTO citas 
        (paciente_id, paciente_nombre, fecha, hora, motivo, estado, prioridad, categoria)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [
        finalPacienteId,
        finalPacienteNombre,
        fecha,
        hora,
        motivo,
        estado    || 'pendiente',
        prioridad || 'baja',
        categoria || 'general'
      ],
      (err) => {
        if (err) {
          console.error('ERROR INSERT:', err.message);
          return res.status(500).json({ error: 'Error en la base de datos' });
        }
        res.status(201).json({ ok: true, mensaje: 'Cita creada correctamente' });
      }
    );

  } catch (error) {
    console.error('createCita error:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// ✅ OBTENER CITAS (admin y técnico ven todas)
const getCitas = (req, res) => {
  try {
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
      ORDER BY citas.id DESC
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error('ERROR GET:', err.message);
        return res.status(500).json({ error: 'Error al obtener citas' });
      }
      res.json({ ok: true, data: results });
    });

  } catch (error) {
    console.error('getCitas error:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// ✅ ACTUALIZAR CITA
const updateCita = (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, hora, motivo, estado, prioridad, categoria } = req.body;

    if (!id) return res.status(400).json({ error: 'ID requerido' });

    db.query('SELECT * FROM citas WHERE id = ?', [id], (err, result) => {
      if (err)                 return res.status(500).json({ error: 'Error en BD' });
      if (result.length === 0) return res.status(404).json({ error: 'Cita no encontrada' });

      const query = `
        UPDATE citas
        SET fecha=?, hora=?, motivo=?, estado=?, prioridad=?, categoria=?
        WHERE id=?
      `;

      db.query(query, [fecha, hora, motivo, estado, prioridad, categoria, id], (err) => {
        if (err) return res.status(500).json({ error: 'Error al actualizar la cita' });
        res.json({ ok: true, mensaje: 'Cita actualizada correctamente' });
      });
    });

  } catch (error) {
    console.error('updateCita error:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// ✅ CAMBIAR ESTADO
const cambiarEstado = (req, res) => {
  try {
    const { id }     = req.params;
    const { estado } = req.body;

    if (!estado) return res.status(400).json({ error: 'Estado requerido' });

    db.query('UPDATE citas SET estado = ? WHERE id = ?', [estado, id], (err) => {
      if (err) {
        console.error('cambiarEstado error:', err.message);
        return res.status(500).json({ error: 'Error al actualizar estado' });
      }
      res.json({ ok: true, mensaje: 'Estado actualizado correctamente' });
    });

  } catch (error) {
    console.error('cambiarEstado error:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// ✅ ELIMINAR CITA
const deleteCita = (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: 'ID requerido' });

    db.query('DELETE FROM citas WHERE id = ?', [id], (err, result) => {
      if (err)                       return res.status(500).json({ error: 'Error al eliminar' });
      if (result.affectedRows === 0) return res.status(404).json({ error: 'Cita no encontrada' });
      res.json({ ok: true, mensaje: 'Cita eliminada correctamente' });
    });

  } catch (error) {
    console.error('deleteCita error:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};


// 📦 EXPORTAR
module.exports = {
  createCita,
  getCitas,
  updateCita,
  cambiarEstado,
  deleteCita
};