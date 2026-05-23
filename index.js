const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET no definido en variables de entorno');
  process.exit(1);
}

console.log('✅ JWT_SECRET cargado correctamente');

app.use(cors());
app.use(express.json());

const db = require('./db');

// 🔧 RUTA TEMPORAL — borrar después de usar
app.get('/fix-passwords', async (req, res) => {
  const bcrypt = require('bcrypt');
  const hash = await bcrypt.hash('admin123', 10);
  db.query('UPDATE usuarios SET password = ?', [hash], (err, result) => {
    if (err) return res.json({ error: err.message });
    res.json({ ok: true, actualizados: result.affectedRows, mensaje: 'Contraseñas reseteadas a admin123' });
  });
});

const usuariosRoutes = require('./routes/usuarios');
const citasRoutes = require('./routes/citas');

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/citas', citasRoutes);

app.use(express.static(path.join(__dirname, 'frontend')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});