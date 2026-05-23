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

// 🔧 DIAGNÓSTICO
app.get('/test-login', async (req, res) => {
  const bcrypt = require('bcrypt');
  db.query('SELECT * FROM usuarios WHERE email = ?', ['pepe@gmail.com'], async (err, results) => {
    if (err) return res.json({ error: err.message });
    if (results.length === 0) return res.json({ error: 'Usuario no encontrado' });
    const user = results[0];
    const valid = await bcrypt.compare('admin123', user.password);
    res.json({
      usuario: user.nombre,
      password_guardado: user.password,
      coincide: valid
    });
  });
});

// 🔧 FIX PASSWORDS
app.get('/fix-passwords', async (req, res) => {
  try {
    const bcrypt = require('bcrypt');
    const hash = await bcrypt.hash('admin123', 10);
    db.query('SELECT id, nombre, email FROM usuarios', async (err, users) => {
      if (err) return res.json({ error: err.message, paso: 'SELECT' });
      if (users.length === 0) return res.json({ error: 'No hay usuarios en la tabla' });
      db.query('UPDATE usuarios SET password = ?', [hash], (err2, result) => {
        if (err2) return res.json({ error: err2.message, paso: 'UPDATE' });
        res.json({ ok: true, usuarios_encontrados: users, actualizados: result.affectedRows });
      });
    });
  } catch(e) {
    res.json({ error: e.message });
  }
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