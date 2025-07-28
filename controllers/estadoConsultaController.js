const EstadoConsulta = require('../models/EstadoConsultaModel');



// Metodo Read: Listar estados de consulta
exports.listarEstadoConsulta = (req, res) => {
    EstadoConsulta.listarEstadoConsulta((err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error al listar los estados de consulta", error: err });
        }

        res.status(200).json(results);
    });
};
// Metodo Read: Listar examanes disponibles
exports.listarExamanes = (req, res) => {
    EstadoConsulta.listarExamanes((err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error al listar los examanes", error: err });
        }

        res.status(200).json(results);
    });
};
// Metodo Read: Listar medicamentos disponibles
exports.listarMedicamentos = (req, res) =>{
    EstadoConsulta.listarMedicamentos((err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error al listar los medicamentos", error: err });
        }

        res.status(200).json(results);
    });
};
// Metodo Read: Listar rayosX disponibles
exports.listarRayosX = (req, res) =>{
    EstadoConsulta.listarRayosX((err, results) => {
        if (err) {
            return res.status(500).json({ message: "Error al listar los examenes Rayos X", error: err });
        }

        res.status(200).json(results);
    });
};
