const db = require('../database/conexion')


const EstadoConsulta = {};


// Listar estado de consulta
EstadoConsulta.listarEstadoConsulta = (callback) => {
    const sql = `SELECT * FROM estado_consulta`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error al listar los estados de consulta:", err);
            return callback(err, null);
        }
        return callback(null, results);
    });
};
// Listar Examanes Disponibles
EstadoConsulta.listarExamanes = (callback) => {
    const sql = `SELECT * FROM tipo_examen`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error al listar examanes:", err);
            return callback(err, null);
        }
        return callback(null, results);
    });
};
// Listar Medicamentos Disponibles
EstadoConsulta.listarMedicamentos = (callback) => {
    const sql = `SELECT * FROM medicamento`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error al listar medicamentos:", err);
            return callback(err, null);
        }
        return callback(null, results);
    });
};
//Listar Imagenes Rayos x Disponibles
EstadoConsulta.listarRayosX = (callback) => {
    const sql = `SELECT * FROM tipo_rayos_x`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("Error al listar examenes rayos x:", err);
            return callback(err, null);
        }
        return callback(null, results);
    });
};

module.exports = EstadoConsulta;