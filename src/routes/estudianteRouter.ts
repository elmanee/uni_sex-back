import { Router } from 'express';
import {
  registrarEstudiante,
  obtenerCatalogo,
  obtenerEstudiantes,
  obtenerEstudiantePorMatricula,
  actualizarEstudiante,
} from '../controllers/estudianteController';
import { uploadArchivos } from '../services/archivoService';
import { authenticateToken } from '../middleware/verifyToken'; // ← AGREGAR ESTO

const router = Router();

// 🔒 Proteger TODAS las rutas con autenticación
router.use(authenticateToken);

// Registrar estudiante con archivos
router.post('/', uploadArchivos, registrarEstudiante); // ← CAMBIO: /estudiantes → /

// Obtener todos los estudiantes
router.get('/', obtenerEstudiantes); // ← CAMBIO: /estudiantes → /

// Obtener estudiante por matrícula
router.get('/:matricula', obtenerEstudiantePorMatricula); // ← CAMBIO: /estudiantes/:matricula → /:matricula

// Actualizar estudiante (solo los campos enviados)
router.patch('/:matricula', uploadArchivos, actualizarEstudiante); // ← CAMBIO: /estudiantes/:matricula → /:matricula

export default router;