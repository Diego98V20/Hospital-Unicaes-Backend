const db = require('../database/conexion');

// Obtener todas las solicitudes de rayos X
const getAll = (callback) => {
  const query = `
    SELECT 
      rx.id_rayos_x,
      rx.id_paciente,
      p.id_paciente AS id_paciente,
      rx.id_tecnico,
      rx.fecha_estudio,
      rx.tipo_estudio,
      rx.estado,
      rx.observaciones_clinicas,
      p.nombre_paciente,
      p.apellido_paciente,
      p.dui_paciente,
      e.nombre AS nombre_equipo,
      u.nombre AS nombre_tecnico,
      u.apellido AS apellido_tecnico
    FROM rayos_x rx
    LEFT JOIN paciente p ON rx.id_paciente = p.id_paciente
    LEFT JOIN equipos_rayos_x e ON rx.id_equipo = e.id_equipo
    LEFT JOIN usuario u ON rx.id_tecnico = u.id_usuario
    ORDER BY rx.fecha_estudio DESC
  `;
  db.query(query, callback);
};

// Obtener por ID
const getById = (id, callback) => {
  const query = `SELECT * FROM rayos_x WHERE id_rayos_x = ?`;
  db.query(query, [id], callback);
};

// Crear
const create = (data, callback) => {
  const query = `
    INSERT INTO rayos_x 
    (id_paciente, id_tecnico, id_equipo, tipo_estudio, estado, fecha_estudio, observaciones_clinicas)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [
    data.id_paciente,
    data.id_tecnico,
    data.id_equipo,
    data.tipo_estudio,
    data.estado,
    data.fecha_estudio,
    data.observaciones_clinicas
  ];
  db.query(query, params, callback);
};

// Actualizar
const update = (id, data, callback) => {
  const query = `
    UPDATE rayos_x SET
      id_paciente = ?, 
      id_tecnico = ?, 
      id_equipo = ?, 
      tipo_estudio = ?, 
      estado = ?, 
      fecha_estudio = ?, 
      observaciones_clinicas = ?
    WHERE id_rayos_x = ?
  `;
  const params = [
    data.id_paciente,
    data.id_tecnico,
    data.id_equipo,
    data.tipo_estudio,
    data.estado,
    data.fecha_estudio,
    data.observaciones_clinicas,
    id
  ];
  db.query(query, params, callback);
};

// Eliminar
const deleteSolicitud = (id, callback) => {
  const query = `DELETE FROM rayos_x WHERE id_rayos_x = ?`;
  db.query(query, [id], callback);
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  delete: deleteSolicitud
};