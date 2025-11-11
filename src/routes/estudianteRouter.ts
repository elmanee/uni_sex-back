import { Router } from 'express';
import {
  registrarEstudiante,
  obtenerCatalogo,
  obtenerEstudiantes,
  obtenerEstudiantePorMatricula,
  actualizarEstudiante,
} from '../controllers/estudianteController';
import { uploadArchivos } from '../services/archivoService';

const router = Router();

// Registrar estudiante con archivos
router.post('/estudiantes', uploadArchivos, registrarEstudiante);

// Obtener todos los estudiantes
router.get('/estudiantes', obtenerEstudiantes);

// Obtener estudiante por matrícula
router.get('/estudiantes/:matricula', obtenerEstudiantePorMatricula);

// Actualizar estudiante (solo los campos enviados)
router.patch('/estudiantes/:matricula', uploadArchivos, actualizarEstudiante);

// Obtener catálogos
router.get('/catalogos/:tipo', obtenerCatalogo);

export default router;
