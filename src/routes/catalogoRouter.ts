import { Router } from "express";
import { CatalogoController } from "../controllers/catalogoController";
import { authenticateToken } from "../middleware/verifyToken"; // ← CAMBIO: verifyToken → authenticateToken

const router = Router();

router.get("/:tipo", authenticateToken, CatalogoController.listar); // ← CAMBIO
router.post("/:tipo", authenticateToken, CatalogoController.crear); // ← CAMBIO
router.patch("/:tipo/:id", authenticateToken, CatalogoController.actualizar); // ← CAMBIO
router.delete("/:tipo/:id", authenticateToken, CatalogoController.eliminar); // ← CAMBIO

export default router;