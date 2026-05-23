const mysql = require('mysql2');
require('dotenv').config();

const conexion = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306
});

conexion.connect((err) => {
    if (err) {
        console.log('Error conectando MySQL:', err);
    } else {
        console.log('Conectado a MySQL');
    }
});

module.exports = conexion;