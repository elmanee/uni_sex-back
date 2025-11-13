import { Router } from 'express';
import {
  registrarEstudiante,
  obtenerCatalogo,
  obtenerEstudiantes,
  obtenerEstudiantePorMatricula,
  actualizarEstudiante,
} from '../controllers/estudianteController';
import { uploadArchivos } from '../services/archivoService';
import { authenticateToken } from '../middleware/verifyToken'; 

const router = Router();

router.use(authenticateToken);

router.post('/', uploadArchivos, registrarEstudiante); 

router.get('/', obtenerEstudiantes); 


router.get('/:matricula', obtenerEstudiantePorMatricula); 
router.patch('/:matricula', uploadArchivos, actualizarEstudiante); 


router.get('/catalogos/:tipo', obtenerCatalogo);

export default router;