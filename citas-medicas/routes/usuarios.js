const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/usuarios', (req, res) => {
    const { nombre, email, password } = req.body;

    const sql = 'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)';

    db.query(sql, [nombre, email, password], (err, result) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.json({ mensaje: 'Usuario creado' });
    });
});

router.get('/usuarios', (req, res) => {
    db.query('SELECT * FROM usuarios', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

module.exports = router;
