const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware'); 
const estadoConsultaController = require('../controllers/estadoConsultaController');
const router = express.Router();



router.get('/listar', authMiddleware, estadoConsultaController.listarEstadoConsulta);
router.get('/listarExamenes', authMiddleware, estadoConsultaController.listarExamanes);
router.get('/listarMedicamentos', authMiddleware, estadoConsultaController.listarMedicamentos);
router.get('/listarRayosX', authMiddleware, estadoConsultaController.listarRayosX);



module.exports = router;