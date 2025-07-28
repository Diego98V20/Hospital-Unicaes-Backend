const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const imagenesCtrl = require('../controllers/imagenesRayosxController');
const authMiddleware = require('../middlewares/authMiddleware');

// Configuración de almacenamiento con Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `rayosx_${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

// Ruta para subir imagen
router.post('/subir', authMiddleware, upload.single('imagen'), imagenesCtrl.subirImagen);

module.exports = router;