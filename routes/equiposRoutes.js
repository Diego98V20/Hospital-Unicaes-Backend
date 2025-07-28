const express = require('express');
const router = express.Router();
const db = require('../database/conexion'); // ajusta si tienes diferente nombre

router.get('/', (req, res) => {
  db.query('SELECT id_equipo, nombre AS nombre_equipo FROM equipos_rayos_x', (err, results) => {
    if (err) {
      console.error('Error al obtener equipos:', err);
      res.status(500).json({ error: 'Error al obtener equipos' });
    } else {
      res.json(results);
    }
  });
});

module.exports = router;