const RayosxModel = require('../models/RayosxModel');

// Obtener todas las solicitudes de rayos X con informe e imagen completados
exports.getAllRayosx = (req, res) => {
  const query = `
    SELECT 
      rx.id_rayos_x,
      rx.id_paciente,
      rx.tipo_estudio,
      rx.fecha_estudio,
      rx.estado,

      p.nombre_paciente AS nombre_paciente,
      p.apellido_paciente AS apellido_paciente,
      p.n_expediente AS n_expediente,

      u.nombre AS nombre_tecnico,
      u.apellido AS apellido_tecnico,

      e.nombre AS nombre_equipo,

      inf.diagnostico,
      inf.recomendaciones,
      inf.fecha_informe,

      img.url_imagen
    FROM rayos_x rx
    JOIN paciente p ON rx.id_paciente = p.id_paciente
    LEFT JOIN usuario u ON rx.id_tecnico = u.id_usuario
    LEFT JOIN equipos_rayos_x e ON rx.id_equipo = e.id_equipo
    LEFT JOIN informes_rayos_x inf ON rx.id_rayos_x = inf.id_rayos_x
    LEFT JOIN imagenes_rayos_x img ON rx.id_rayos_x = img.id_rayos_x
    WHERE inf.diagnostico IS NOT NULL AND img.url_imagen IS NOT NULL
    ORDER BY rx.fecha_estudio DESC
  `;

  req.app.get('db').query(query, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener informes completos:', err);
      return res.status(500).json({ error: 'Error al obtener los informes' });
    }

    res.json(results);
  });
};

// Completar solicitud: actualiza estado a 'completado' y guarda fecha_estudio
exports.completarSolicitud = (req, res) => {
  const id = req.params.id;
  const fechaFinal = new Date().toISOString();

  const query = `
    UPDATE rayos_x
    SET estado = 'completado', fecha_estudio = ?
    WHERE id_rayos_x = ?
  `;

  req.app.get('db').query(query, [fechaFinal, id], (err, result) => {
    if (err) {
      console.error('❌ Error al completar la solicitud:', err);
      return res.status(500).json({ error: 'Error al completar la solicitud' });
    }

    res.json({ message: 'Solicitud marcada como completada', fecha_estudio: fechaFinal });
  });
};

// Obtener solicitudes asignadas al técnico logueado usando id_usuario
exports.getRayosxPorTecnico = (req, res) => {
  const tecnicoId = req.session.user?.id_usuario;

  if (!tecnicoId) {
    return res.status(401).json({ message: 'Técnico no autenticado' });
  }

  const query = `
    SELECT 
      rx.id_rayos_x,
      rx.id_paciente,
      rx.fecha_estudio,
      rx.tipo_estudio,
      rx.estado,
      rx.observaciones_clinicas,

      p.nombre_paciente,
      p.apellido_paciente,
      p.n_expediente AS n_expediente,

      e.nombre AS nombre_equipo,

      inf.diagnostico,
      inf.recomendaciones,
      inf.fecha_informe,

      img.url_imagen
    FROM rayos_x rx
    LEFT JOIN paciente p ON rx.id_paciente = p.id_paciente
    LEFT JOIN equipos_rayos_x e ON rx.id_equipo = e.id_equipo
    LEFT JOIN informes_rayos_x inf ON rx.id_rayos_x = inf.id_rayos_x
    LEFT JOIN imagenes_rayos_x img ON rx.id_rayos_x = img.id_rayos_x
    WHERE rx.id_tecnico IS NULL OR rx.id_tecnico = ?
  `;

  req.app.get('db').query(query, [tecnicoId], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener solicitudes por técnico:', err);
      return res.status(500).json({ error: 'Error de servidor' });
    }

    res.json(results);
  });
};

// Obtener una solicitud de rayos X por ID (INFORME COMPLETO)
exports.getRayosxById = (req, res) => {
  const id = req.params.id;

  const query = `
    SELECT 
      rx.id_rayos_x,
      rx.id_paciente,
      rx.fecha_estudio,
      rx.tipo_estudio,
      rx.estado,
      rx.observaciones_clinicas,

      p.nombre_paciente,
      p.apellido_paciente,
      p.n_expediente AS n_expediente,

      u.nombre AS nombre_tecnico,
      u.apellido AS apellido_tecnico,

      e.nombre AS nombre_equipo,

      inf.diagnostico,
      inf.recomendaciones,
      inf.fecha_informe,

      img.url_imagen
    FROM rayos_x rx
    LEFT JOIN paciente p ON rx.id_paciente = p.id_paciente
    LEFT JOIN usuario u ON rx.id_tecnico = u.id_usuario
    LEFT JOIN equipos_rayos_x e ON rx.id_equipo = e.id_equipo
    LEFT JOIN informes_rayos_x inf ON rx.id_rayos_x = inf.id_rayos_x
    LEFT JOIN imagenes_rayos_x img ON rx.id_rayos_x = img.id_rayos_x
    WHERE rx.id_rayos_x = ?
  `;

  req.app.get('db').query(query, [id], (err, results) => {
    if (err) {
      console.error('❌ Error al obtener el informe:', err);
      return res.status(500).json({ error: 'Error al obtener el informe' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Informe no encontrado' });
    }

    res.json(results[0]);
  });
};

// Crear una nueva solicitud de rayos X (técnico desde sesión)
exports.createRayosx = (req, res) => {
  const tecnicoId = req.session.user?.id_usuario;

  if (!tecnicoId) {
    return res.status(401).json({ error: 'Técnico no autenticado' });
  }

  const data = {
    ...req.body,
    id_tecnico: tecnicoId
  };

  RayosxModel.create(data, (err, result) => {
    if (err) {
      console.error('Error al crear solicitud de rayos X:', err);
      res.status(500).json({ error: 'Error al crear solicitud' });
    } else {
      res.status(201).json({ message: 'Solicitud creada correctamente', id: result.insertId });
    }
  });
};

// Actualizar una solicitud existente (técnico desde sesión)
exports.updateRayosx = (req, res) => {
  const id = req.params.id;
  const tecnicoId = req.session.user?.id_usuario;

  if (!tecnicoId) {
    return res.status(401).json({ error: 'Técnico no autenticado' });
  }

  const data = {
    ...req.body,
    id_tecnico: tecnicoId
  };

  RayosxModel.update(id, data, (err) => {
    if (err) {
      console.error('Error al actualizar solicitud de rayos X:', err);
      res.status(500).json({ error: 'Error al actualizar solicitud' });
    } else {
      res.json({ message: 'Solicitud actualizada correctamente' });
    }
  });
};

// Eliminar una solicitud
exports.deleteRayosx = (req, res) => {
  const id = req.params.id;
  RayosxModel.delete(id, (err) => {
    if (err) {
      console.error('Error al eliminar solicitud de rayos X:', err);
      res.status(500).json({ error: 'Error al eliminar solicitud' });
    } else {
      res.json({ message: 'Solicitud eliminada correctamente' });
    }
  });
};

// Obtener solicitudes de rayos X con informe completado para médicos
exports.getRayosxInformesMedico = (req, res) => {
  const query = `
    SELECT 
      rx.id_rayos_x,
      rx.id_paciente,
      rx.fecha_estudio,
      rx.tipo_estudio,
      rx.estado,
      rx.observaciones_clinicas,
      p.nombre_paciente,
      p.apellido_paciente,
      p.n_expediente AS n_expediente,
      e.nombre AS nombre_equipo,
      inf.diagnostico,
      inf.recomendaciones,
      inf.fecha_informe,
      img.url_imagen,
      u.nombre AS nombre_tecnico,
      u.apellido AS apellido_tecnico
    FROM rayos_x rx
    LEFT JOIN paciente p ON rx.id_paciente = p.id_paciente
    LEFT JOIN equipos_rayos_x e ON rx.id_equipo = e.id_equipo
    LEFT JOIN informes_rayos_x inf ON rx.id_rayos_x = inf.id_rayos_x
    LEFT JOIN imagenes_rayos_x img ON rx.id_rayos_x = img.id_rayos_x
    LEFT JOIN usuario u ON rx.id_tecnico = u.id_usuario
    WHERE rx.estado = 'completado'
  `;

  req.app.get('db').query(query, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener informes médicos:', err);
      return res.status(500).json({ error: 'Error de servidor' });
    }

    res.json(results);
  });
};

// Asignar técnico actual y actualizar estado a 'completado'
exports.asignarTecnicoYActualizarEstado = (req, res) => {
  const id = req.params.id;
  const tecnicoId = req.session.user?.id_usuario;

  if (!tecnicoId) {
    return res.status(401).json({ message: 'Técnico no autenticado' });
  }

  const query = `
    UPDATE rayos_x
    SET id_tecnico = ?, estado = 'completado'
    WHERE id_rayos_x = ?
  `;

  req.app.get('db').query(query, [tecnicoId, id], (err, result) => {
    if (err) {
      console.error('❌ Error al asignar técnico y actualizar estado:', err);
      return res.status(500).json({ error: 'Error de servidor' });
    }

    res.json({ message: 'Estudio marcado como realizado y técnico asignado' });
  });
};

// Obtener TODAS las solicitudes de rayos X sin filtro (para selección en wizard)
exports.obtenerTodasSolicitudesRayosX = (req, res) => {
  const query = `
    SELECT 
      rx.id_rayos_x,
      rx.id_paciente,
      rx.id_tecnico,
      rx.id_equipo,
      rx.fecha_estudio,
      rx.tipo_estudio,
      rx.estado,
      rx.observaciones_clinicas,

      p.nombre_paciente,
      p.apellido_paciente,
      p.n_expediente AS n_expediente,

      u.nombre AS nombre_tecnico,
      u.apellido AS apellido_tecnico,

      e.nombre AS nombre_equipo
    FROM rayos_x rx
    LEFT JOIN paciente p ON rx.id_paciente = p.id_paciente
    LEFT JOIN usuario u ON rx.id_tecnico = u.id_usuario
    LEFT JOIN equipos_rayos_x e ON rx.id_equipo = e.id_equipo
    WHERE rx.id_paciente IS NOT NULL
      AND rx.id_equipo IS NOT NULL
      AND rx.tipo_estudio IS NOT NULL
      AND rx.fecha_estudio IS NOT NULL
    ORDER BY rx.fecha_estudio DESC
  `;

  req.app.get('db').query(query, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener todas las solicitudes:', err);
      return res.status(500).json({ error: 'Error al obtener solicitudes' });
    }

    res.json(results);
  });
};

// Obtener TODAS las solicitudes de Rayos X sin importar si tienen imagen o informe
exports.getTodasLasSolicitudes = (req, res) => {
  const query = `
    SELECT 
      rx.id_rayos_x,
      rx.id_paciente,
      rx.tipo_estudio,
      rx.fecha_estudio,
      rx.estado,
      rx.observaciones_clinicas,

      p.nombre_paciente,
      p.apellido_paciente,
      p.n_expediente AS n_expediente,

      u.nombre AS nombre_tecnico,
      u.apellido AS apellido_tecnico,

      e.nombre AS nombre_equipo,

      inf.diagnostico,
      inf.recomendaciones,
      inf.fecha_informe,

      img.url_imagen
    FROM rayos_x rx
    LEFT JOIN paciente p ON rx.id_paciente = p.id_paciente
    LEFT JOIN usuario u ON rx.id_tecnico = u.id_usuario
    LEFT JOIN equipos_rayos_x e ON rx.id_equipo = e.id_equipo
    LEFT JOIN informes_rayos_x inf ON rx.id_rayos_x = inf.id_rayos_x
    LEFT JOIN imagenes_rayos_x img ON rx.id_rayos_x = img.id_rayos_x
    ORDER BY rx.fecha_estudio DESC
  `;

  req.app.get('db').query(query, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener todas las solicitudes:', err);
      return res.status(500).json({ error: 'Error al obtener todas las solicitudes' });
    }

    res.json(results);
  });
};

// Obtener todas las solicitudes de rayos X para todos los técnicos (sin filtro por sesión)
exports.getRayosxParaTodosLosTecnicos = (req, res) => {
  const query = `SELECT 
  rx.id_rayos_x,
  rx.id_paciente,
  rx.fecha_estudio,
  rx.tipo_estudio,
  rx.estado,
  rx.observaciones_clinicas,

  p.nombre_paciente,
  p.apellido_paciente,
  p.n_expediente AS n_expediente,

  u.nombre AS nombre_tecnico,
  u.apellido AS apellido_tecnico,

  e.nombre AS nombre_equipo,

  inf.diagnostico,
  inf.recomendaciones,
  inf.fecha_informe,

  img.url_imagen
FROM rayos_x rx
LEFT JOIN paciente p ON rx.id_paciente = p.id_paciente
LEFT JOIN usuario u ON rx.id_tecnico = u.id_usuario
LEFT JOIN equipos_rayos_x e ON rx.id_equipo = e.id_equipo
LEFT JOIN informes_rayos_x inf ON rx.id_rayos_x = inf.id_rayos_x
LEFT JOIN imagenes_rayos_x img ON rx.id_rayos_x = img.id_rayos_x
ORDER BY rx.fecha_estudio DESC`;

  req.app.get('db').query(query, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener solicitudes para todos los técnicos:', err);
      return res.status(500).json({ error: 'Error de servidor' });
    }

    res.json(results);
  });
};

// Obtener solicitudes en estado "pendiente"
exports.getSolicitudesPendientes = (req, res) => {
  const query = `
    SELECT 
      rx.id_rayos_x,
      rx.id_paciente,
      rx.id_tecnico,
      rx.id_equipo,
      rx.fecha_estudio,
      rx.tipo_estudio,
      rx.estado,
      rx.observaciones_clinicas,

      p.nombre_paciente,
      p.apellido_paciente,
      p.n_expediente AS n_expediente,

      u.nombre AS nombre_tecnico,
      u.apellido AS apellido_tecnico,

      e.nombre AS nombre_equipo
    FROM rayos_x rx
    LEFT JOIN paciente p ON rx.id_paciente = p.id_paciente
    LEFT JOIN usuario u ON rx.id_tecnico = u.id_usuario
    LEFT JOIN equipos_rayos_x e ON rx.id_equipo = e.id_equipo
    WHERE rx.estado = 'pendiente'
    ORDER BY rx.fecha_estudio DESC
  `;

  req.app.get('db').query(query, (err, results) => {
    if (err) {
      console.error('❌ Error al obtener solicitudes pendientes:', err);
      return res.status(500).json({ error: 'Error al obtener solicitudes pendientes' });
    }

    res.json(results);
  });
};