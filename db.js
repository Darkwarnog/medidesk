const mysql = require('mysql2');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const pool = mysql.createPool({
  host:               process.env.DB_HOST,
  user:               process.env.DB_USER,
  password:           process.env.DB_PASSWORD,
  database:           process.env.DB_NAME,
  port:               process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  enableKeepAlive:    true,
  keepAliveInitialDelay: 0
});

// ✅ Verificar conexión sin detener el servidor si falla
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error conectando MySQL:', err.message);
    console.log('El servidor seguirá intentando conectar...');
    return;
  }
  console.log('Conectado a MySQL correctamente');
  connection.release();
});

module.exports = pool;