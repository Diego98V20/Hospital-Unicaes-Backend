const express = require('express');
const router = express.Router();
const informesCtrl = require('../controllers/informesRayosxController');
const authMiddleware = require('../middlewares/authMiddleware');

// Ruta protegida para crear informe
router.post('/', authMiddleware, informesCtrl.crearInforme);

module.exports = router;