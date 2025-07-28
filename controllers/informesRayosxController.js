const db = require('../database/conexion');

// Crear informe de rayos X
exports.crearInforme = (req, res) => {
  console.log('📥 Datos recibidos para guardar informe:', req.body); // Borrar después
  const { id_rayos_x, diagnostico, recomendaciones, fecha_informe } = req.body;

  // Validaciones básicas
  if (!id_rayos_x || !diagnostico?.trim() || !recomendaciones?.trim() || !fecha_informe) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const query = `
    INSERT INTO informes_rayos_x (id_rayos_x, diagnostico, recomendaciones, fecha_informe)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [id_rayos_x, diagnostico.trim(), recomendaciones.trim(), fecha_informe], (err, result) => {
    if (err) {
      console.error('❌ Error al guardar informe:', err);
      return res.status(500).json({ error: 'Error al guardar informe' });
    }

    res.status(201).json({
      mensaje: '✅ Informe guardado correctamente',
      id: result.insertId
    });
  });
};