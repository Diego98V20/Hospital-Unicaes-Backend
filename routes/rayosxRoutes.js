const express = require('express');
const router = express.Router();
const rayosxController = require('../controllers/rayosxController');

// Middleware para verificar la sesión activa
const verificarSesion = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Sesión no válida o expirada' });
  }
  next();
};

// ✅ Rutas específicas primero (importante el orden)
router.get('/pendientes', rayosxController.getSolicitudesPendientes);
router.get('/completados', rayosxController.getRayosxInformesMedico); // Vista para médicos
router.get('/mis-solicitudes', verificarSesion, rayosxController.getRayosxPorTecnico); // Vista para técnicos
router.get('/todas', rayosxController.getTodasLasSolicitudes);
router.get('/todas-solicitudes', rayosxController.getRayosxParaTodosLosTecnicos);

// General y dinámica al final
router.get('/:id', rayosxController.getRayosxById); // Ver solicitud específica
router.post('/', verificarSesion, rayosxController.createRayosx); // Crear nueva solicitud
router.put('/:id', verificarSesion, rayosxController.updateRayosx); // Editar solicitud
router.put('/asignar-estudio/:id', verificarSesion, rayosxController.asignarTecnicoYActualizarEstado); // Asignar técnico + marcar como realizado
router.put('/:id/completar', verificarSesion, rayosxController.completarSolicitud);
router.delete('/:id', verificarSesion, rayosxController.deleteRayosx); // Eliminar solicitud

module.exports = router;