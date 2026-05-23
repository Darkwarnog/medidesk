const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/citas', (req, res) => {
    const { paciente_id, fecha, hora, motivo } = req.body;

    const sql = 'INSERT INTO citas (paciente_id, fecha, hora, motivo) VALUES (?, ?, ?, ?)';

    db.query(sql, [paciente_id, fecha, hora, motivo], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ mensaje: 'Cita creada' });
    });
});

router.get('/citas', (req, res) => {
    db.query('SELECT * FROM citas', (err, result) => {
        if (err) return res.status(500).json(err);
        res.json(result);
    });
});

router.put('/citas/:id', (req, res) => {
    const { id } = req.params;
    const { fecha, hora, motivo } = req.body;

    const sql = 'UPDATE citas SET fecha=?, hora=?, motivo=? WHERE id=?';

    db.query(sql, [fecha, hora, motivo, id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ mensaje: 'Cita actualizada' });
    });
});

router.delete('/citas/:id', (req, res) => {
    const { id } = req.params;

    db.query('DELETE FROM citas WHERE id=?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ mensaje: 'Cita eliminada' });
    });
});

module.exports = router;