const db = require('../database/conexion')

const Seguimiento = {};

Seguimiento.obtenerSeguimientoPorConsulta = (id_consulta, callback) => {
    const queryConsulta = `
        SELECT 
        c.id_consulta, 
        c.fecha_consulta, 
        c.motivo_consulta, 
        p.nombre_paciente, 
        p.sexo_paciente,
        p.fecha_nacimiento_paciente,
        TIMESTAMPDIFF(YEAR, p.fecha_nacimiento_paciente, CURDATE()) AS edad,
        p.dui_paciente,
        p.telefono_paciente,
        p.direccion_paciente,
        esp.nombre_especialidad
        FROM consulta c
        INNER JOIN paciente p ON c.id_paciente = p.id_paciente
        INNER JOIN especialidad esp ON c.id_especialidad = esp.id_especialidad
        WHERE c.id_consulta = ?;
    `;

    db.query(queryConsulta, [id_consulta], (err, consultaData) => {
        if (err) return callback(err);
        if (!consultaData.length) return callback(null, null);

        const consulta = consultaData[0];

        const queryMedicamentos = `
            SELECT 
            rm.id_receta,
            dr.id_medicamento,
            m.nombre AS nombre_medicamento,
            dr.cantidad,
            dr.dosis,
            dr.frecuencia,
            dr.duracion
            FROM receta_medica rm
            JOIN detalle_receta dr ON rm.id_receta = dr.id_receta
            JOIN medicamento m ON dr.id_medicamento = m.id_medicamento
            WHERE rm.id_consulta = ?
            ORDER BY 
                rm.id_consulta;
        `;

        db.query(queryMedicamentos, [id_consulta], (err, medicamentos) => {
            if (err) return callback(err);

            const queryExamenes = `
                SELECT 
                    te.nombre AS nombre_examen,
                    e.fecha_solicitud,
                    r.nombre_parametro,
                    r.valor,
                    r.unidad,
                    r.rango_referencia
                    FROM detalle_consulta dc
                    JOIN consulta c ON dc.id_consulta = c.id_consulta
                    JOIN muestra m ON m.id_paciente = c.id_paciente
                    JOIN examen e ON e.id_muestra = m.id_muestra
                    JOIN tipo_examen te ON te.id_tipo_examen = e.id_tipo_examen
                    LEFT JOIN resultados r ON r.id_examen = e.id_examen
                    WHERE dc.id_consulta = ?;
                
            `;

            db.query(queryExamenes, [id_consulta], (err, examenes) => {
                if (err) return callback(err);

                const seguimiento = {
                    nombre_paciente: consulta.nombre_paciente,
                    sexo_paciente: consulta.sexo_paciente,
                    edad: consulta.edad,
                    fecha_nacimiento_paciente: consulta.fecha_nacimiento_paciente,
                    dui_paciente: consulta.dui_paciente,
                    telefono_paciente: consulta.telefono_paciente,
                    direccion_paciente: consulta.direccion_paciente,
                    medicamentos: medicamentos.map(m => ({
                        nombre_medicamento: m.nombre_medicamento,
                        dosis: m.dosis,
                        frecuencia: m.frecuencia
                    })),
                    examenes: examenes.map(e => ({
                          nombre_examen: e.nombre_examen,
                          nombre_parametro: e.nombre_parametro,
                          valor: e.valor,
                          unidad: e.unidad,
                          rango_referencia: e.rango_referencia
                    }))
                };

                return callback(null, seguimiento);
            });
        });
    });
};

Seguimiento.obtenerSeguimientosPorPaciente = (id_paciente, callback) => {
    const queryConsultas = `
        SELECT 
            c.id_consulta, 
            c.fecha_consulta, 
            c.motivo_consulta, 
            esp.nombre_especialidad
        FROM consulta c
        INNER JOIN especialidad esp ON c.id_especialidad = esp.id_especialidad
        WHERE c.id_paciente = ?
        ORDER BY c.fecha_consulta DESC;
    `;

    db.query(queryConsultas, [id_paciente], async (err, consultas) => {
        if (err) return callback(err);

        const resultados = [];

        for (const consulta of consultas) {
            const medicamentos = await new Promise((resolve, reject) => {
                db.query(`
                    SELECT 
                        m.nombre AS nombre_medicamento,
                        dr.cantidad,
                        dr.dosis,
                        dr.frecuencia,
                        dr.duracion
                    FROM receta_medica rm
                    JOIN detalle_receta dr ON rm.id_receta = dr.id_receta
                    JOIN medicamento m ON dr.id_medicamento = m.id_medicamento
                    WHERE rm.id_consulta = ?;
                `, [consulta.id_consulta], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });

            const examenes = await new Promise((resolve, reject) => {
                db.query(`
                    SELECT 
                        te.nombre AS nombre_examen,
                        e.fecha_solicitud,
                        r.nombre_parametro,
                        r.valor,
                        r.unidad,
                        r.rango_referencia
                    FROM detalle_consulta dc
                    JOIN consulta c ON dc.id_consulta = c.id_consulta
                    JOIN muestra m ON m.id_paciente = c.id_paciente
                    JOIN examen e ON e.id_muestra = m.id_muestra
                    JOIN tipo_examen te ON te.id_tipo_examen = e.id_tipo_examen
                    LEFT JOIN resultados r ON r.id_examen = e.id_examen
                    WHERE c.id_consulta = ?;
                `, [consulta.id_consulta], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            });

            resultados.push({
                ...consulta,
                medicamentos,
                examenes
            });
        }

        return callback(null, resultados);
    });
};

module.exports = Seguimiento;