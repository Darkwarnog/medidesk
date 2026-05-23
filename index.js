const express = require('express');
const app = express();
const cors = require('cors');
const path = require('path');
require('dotenv').config();

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

// 🔹 puerto dinámico para Render
const PORT = process.env.PORT || 3000;

// 🔹 iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});