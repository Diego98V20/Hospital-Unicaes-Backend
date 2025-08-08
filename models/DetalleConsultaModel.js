const db = require('../database/conexion')
const DetalleConsulta = {};

// Listar consultas (activas)
DetalleConsulta.listarDetallesConsultasActivas = (callback) => {
    const sql = `SELECT * FROM detalle_consulta WHERE estado = 'activo'`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error al listar el detalle de las consultas activas:", err);
            return callback(err, null);
        }
        return callback(null, results);
    });
};

DetalleConsulta.listarDetalleConsultasById = (id, callback) => {

    const sql = `CALL sp_ListarDetalleConsultaById(?)`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Error al listar los detalles del usuario seleccionado:", err);
            return callback(err, null);
        }
        return callback(null, result);
    });

}

//hacer la consulta aqui? para imprimir el pdf
DetalleConsulta.listarDetalleConsultasByIdDetallePDF = (id, callback) => {
    //const sql = `CALL sp_ListarConsultaById`;
    const sql = `SELECT CONCAT(p.nombre_paciente, ' ', p.apellido_paciente) AS nombre_paciente, p.n_expediente, c.fecha_consulta AS fecha, tc.nombre_tipo_consulta AS tipo_consulta, c.estado_paciente, c.motivo_consulta AS motivo_enfermeria, ec.nombre_estado_consulta AS estado_consulta, dc.motivo_consulta AS motivo_consulta_detalle, dc.presente_enfermedad, dc.antecedentes, dc.presion_arterial, dc.frecuencia_cardiaca, dc.saturacion_oxigeno, dc.temperatura, dc.peso, dc.altura, dc.diagnostico, dc.observaciones, dc.examen_fisico FROM detalle_consulta dc LEFT JOIN consulta c ON dc.id_consulta = c.id_consulta LEFT JOIN paciente p ON c.id_paciente = p.id_paciente LEFT JOIN tipo_consulta tc ON c.id_tipo_consulta = tc.id_tipo_consulta LEFT JOIN estado_consulta ec ON dc.id_estado_consulta = ec.id_estado_consulta LEFT JOIN usuario u ON c.id_usuario = u.id_usuario WHERE c.id_usuario = (?) ORDER BY dc.id_detalle_consulta DESC LIMIT 1;
`;

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error("Model: Error al listar los detalles del usuario seleccionado:", err);
            return callback(err, null);
        }
        return callback(null, result);
    });

}

DetalleConsulta.insertarDetalleConsulta = (consultaDetalleData, callback) => {
  const sql = `CALL sp_InsertarDetalleConsulta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const {
    id_estado_consulta,
    motivo_consulta,
    presente_enfermedad,
    antecedentes,
    presion_arterial,
    frecuencia_cardiaca,
    saturacion_oxigeno,
    temperatura,
    peso,
    altura,
    diagnostico,
    observaciones,
    examen_fisico,
    id_consulta,
    id_usuario,
    id_paciente,
    examenes = [],
    medicamentos = [],
    rayosX = []
  } = consultaDetalleData;

  db.query(sql, [
    id_estado_consulta,
    motivo_consulta,
    presente_enfermedad,
    antecedentes,
    presion_arterial,
    frecuencia_cardiaca,
    saturacion_oxigeno,
    temperatura,
    peso,
    altura,
    diagnostico,
    observaciones,
    examen_fisico,
    id_consulta,
    id_usuario
  ], (err, result) => {
    if (err) {
      console.error("Error al insertar el detalle de consulta:", err);
      return callback(err, null);
    }

    const id_detalle_consulta = result[0][0].id_detalle_consulta;
    const id_receta = result[0][0].id_receta; 
    if (examenes.length === 0 && medicamentos.length === 0) {
      return callback(null, { mensaje: "Detalle insertado sin exámenes ni medicamentos." });
    }

    // 1. Obtener tipo de muestra
    const id_tipo_muestra = 1;

  //OBTENER id_paciente desde la tabla consulta
  db.query(
  `SELECT id_paciente FROM consulta WHERE id_consulta = ?`,
  [id_consulta],
  (err, rows) => {
    if (err) {
      console.error("Error al obtener id_paciente desde consulta:", err);
      return callback(err, null);
    }

    if (!rows.length || !rows[0].id_paciente) {
      console.error("No se encontró id_paciente para la consulta:", id_consulta);
      return callback(new Error("No se encontró id_paciente"), null);
    }

    const id_paciente = rows[0].id_paciente;

    // Obtener el contador actual para ese tipo de muestra y paciente
  db.query(
    `SELECT COUNT(*) AS total FROM muestra WHERE id_paciente = ? AND id_tipo_muestra = ?`,
    [id_paciente, id_tipo_muestra],
    (err, resultadoConteo) => {
      if (err) {
        console.error("Error al contar muestras previas:", err);
        return callback(err, null);
      }

      const total = resultadoConteo[0].total + 1;

      // Asignar un prefijo según el tipo de muestra
      let prefijo = '';
      switch (id_tipo_muestra) {
        case 1: prefijo = 'SAN'; break; // sangre
        case 2: prefijo = 'ORI'; break; // orina
        case 3: prefijo = 'HEC'; break; // heces
        default: prefijo = 'MUE'; break; // defecto
      }

    const nombre_muestra = `${prefijo}${total.toString().padStart(2, '0')}`;

    // Insertar la muestra con nombre_muestra generado
    db.query(
      `INSERT INTO muestra (id_paciente, id_tipo_muestra, nombre_muestra, fecha_toma)
       VALUES (?, ?, ?, NOW())`,
      [id_paciente, id_tipo_muestra, nombre_muestra],
      (err, resultadoMuestra) => {
        if (err) {
          console.error("Error al insertar muestra:", err);
          return callback(err, null);
        }

        const id_muestra = resultadoMuestra.insertId;

        // Insertar exámenes en tabla examen
        let insertsPendientes = 0;
        let errorOcurrido = false;

        const verificarFinal = () => {
          if (insertsPendientes === 0 && !errorOcurrido) {
            return callback(null, { mensaje: "Detalle y exámenes/medicamentos guardados con éxito." });
          }
        };
        

        examenes.forEach((id_tipo_examen) => {
          insertsPendientes++;
          db.query(
            `INSERT INTO examen (id_muestra, id_tipo_examen, id_usuario, fecha_solicitud)
             VALUES (?, ?, ?, NOW())`,
            [id_muestra, id_tipo_examen, id_usuario],
            (err) => {
              insertsPendientes--;
              if (err && !errorOcurrido) {
                errorOcurrido = true;
                console.error("Error al insertar examen:", err);
                return callback(err, null);
              }
              verificarFinal();
            }
          );
        });

        medicamentos.forEach((med) => {
          insertsPendientes++;
          db.query(
            `INSERT INTO detalle_receta (id_receta, id_medicamento, cantidad, dosis, frecuencia, duracion)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [id_receta, med.id_medicamento, med.cantidad, med.dosis, med.frecuencia, med.duracion],
            (err) => {
              insertsPendientes--;
              if (err && !errorOcurrido) {
                errorOcurrido = true;
                console.error("Error al insertar medicamento:", err);
                return callback(err, null);
              }
              verificarFinal();
            }
          );
        });
        rayosX.forEach((id_tipo_rayos_x) => {
          insertsPendientes++;
          db.query(
            `INSERT INTO rayos_x (id_paciente, id_tecnico, id_tipo_rayos_x)
            VALUES (?, ?, ?)`,
            [id_paciente, id_usuario, id_tipo_rayos_x],
            (err) => {
              insertsPendientes--;
              if (err && !errorOcurrido) {
                errorOcurrido = true;
                console.error("Error al insertar rayos X:", err);
                return callback(err, null);
              }
              verificarFinal();
            }
          );
        });

      }
    );
  });
  });
})
};

DetalleConsulta.actualizarDetalleConsulta = (id, consultaDetalleData, callback) => {
    const sql = `CALL sp_ActualizarDetalleConsulta(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const {
        id_estado_consulta,
        motivo_consulta,
        presente_enfermedad,
        antecedentes,
        presion_arterial,
        frecuencia_cardiaca,
        saturacion_oxigeno,
        temperatura,
        peso,
        altura,
        diagnostico,
        observaciones,
        examen_fisico,
        id_consulta
    } = consultaDetalleData;

    db.query(sql, [
        id,
        id_estado_consulta,
        motivo_consulta,
        presente_enfermedad,
        antecedentes,
        presion_arterial,
        frecuencia_cardiaca,
        saturacion_oxigeno,
        temperatura,
        peso,
        altura,
        diagnostico,
        observaciones,
        examen_fisico,
        id_consulta
    ], (err, result) => {
        if (err) {
            console.error("Error al actualizar el detalle de la consulta:", err);
            return callback(err, null);
        }
        return callback(null, result);
    });
};


// Cambiar estado del detalle de la consulta, metodo DELETE pero solo cambio de estado,  no elimina registros (no es recomendado)
DetalleConsulta.cambiarEstadoDetalleConsulta = (id, nuevoEstado, callback) => {
    const sql = `UPDATE detalle_consulta SET estado = ? WHERE id_consulta = ?`;

    db.query(sql, [nuevoEstado, id], (err, result) => {
        if (err) {
            console.error("Error al cambiar estado del detalle de la consulta:", err);
            return callback(err, null);
        }
        return callback(null, result);
    });
};

module.exports = DetalleConsulta;