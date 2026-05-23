const validarCita = (req, res, next) => {

  const { paciente_id, fecha, hora, motivo, estado } = req.body;

  if (!paciente_id) {
    return res.status(400).json({ error: 'El paciente es obligatorio' });
  }

  if (!fecha) {
    return res.status(400).json({ error: 'La fecha es obligatoria' });
  }

  if (!hora) {
    return res.status(400).json({ error: 'La hora es obligatoria' });
  }

  if (!motivo || motivo.length < 5) {
    return res.status(400).json({ error: 'Motivo muy corto' });
  }

  if (!estado) {
    return res.status(400).json({ error: 'El estado es obligatorio' });
  }

  next();
};

module.exports = validarCita;