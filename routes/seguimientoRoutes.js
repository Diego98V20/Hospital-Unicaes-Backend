const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware'); 
const seguimientoController = require('../controllers/seguimientoController');

router.get('/seguimiento-consulta/:id_consulta',authMiddleware,  seguimientoController.obtenerSeguimientoPorConsulta);
router.get('/seguimiento-paciente/:id_paciente',authMiddleware,  seguimientoController.obtenerSeguimientosPorPaciente);

module.exports = router;
