const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');

// ✅ Solo carga .env en local, no en Railway
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// ✅ Validar variables críticas al arrancar
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET no definido en variables de entorno');
  process.exit(1);
}

console.log('✅ JWT_SECRET cargado correctamente');

app.use(cors());
app.use(express.json());

// 🔹 rutas
const usuariosRoutes = require('./routes/usuarios');
const citasRoutes = require('./routes/citas');

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/citas', citasRoutes);

// 🔹 servir frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// 🔹 ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// ✅ Puerto dinámico que Railway asigna
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en puerto ${PORT}`);
});