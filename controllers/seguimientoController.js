const db = require('../database/conexion')
const Seguimiento = require('../models/SeguimientoModel');
//Por consulta
exports.obtenerSeguimientoPorConsulta = (req, res) => {
    const { id_consulta } = req.params;
    Seguimiento.obtenerSeguimientoPorConsulta(id_consulta, (err, data) => {
        if (err) {
            console.error("Error al obtener seguimiento:", err);
            return res.status(500).json({ mensaje: "Error del servidor" });
        }

        if (!data) {
            return res.status(404).json({ mensaje: "Consulta no encontrada" });
        }

        return res.status(200).json(data);
    });
};

    //Por Paciente
    exports.obtenerSeguimientosPorPaciente = (req, res) => {
    const { id_paciente } = req.params;
    Seguimiento.obtenerSeguimientosPorPaciente(id_paciente, (err, data) => {
            if (err) {
                console.error("Error al obtener seguimiento:", err);
                return res.status(500).json({ mensaje: "Error del servidor" });
            }

            if (!data) {
                return res.status(404).json({ mensaje: "Consulta no encontrada" });
            }

            return res.status(200).json(data);
        });
    };

