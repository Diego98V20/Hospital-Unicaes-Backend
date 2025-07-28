const db = require('../database/conexion');
const path = require('path');

// Función para subir imagen (usando multer)
exports.subirImagen = (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No se proporcionó ninguna imagen' });
  }

  const { id_rayos_x } = req.body;

  if (!id_rayos_x) {
    return res.status(400).json({ error: 'id_rayos_x es obligatorio' });
  }

  const url_imagen = `/uploads/${file.filename}`; // ← esto está bien si el frontend accede por http://localhost:8081/uploads/...
  const formato = path.extname(file.originalname).slice(1);
  const fecha_subida = new Date();

  const query = `
    INSERT INTO imagenes_rayos_x (id_rayos_x, url_imagen, formato, fecha_subida)
    VALUES (?, ?, ?, ?)
  `;

  db.query(query, [id_rayos_x, url_imagen, formato, fecha_subida], (err, result) => {
    if (err) {
      console.error('❌ Error al guardar imagen en la base de datos:', err);
      return res.status(500).json({ error: 'Error al guardar imagen en BD' });
    }

    res.status(201).json({ mensaje: '✅ Imagen guardada correctamente', id: result.insertId });
  });
};