exports.obtenerEquipos = (req, res) => {
  const db = require('../database/conexion');
  const sql = `
    SELECT id_equipo, CONCAT(nombre, ' - ', modelo, ' (', fabricante, ')') AS nombre_equipo
    FROM equipos_rayos_x
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(result);
  });
};