import { Router } from "express";
import { loginUsuario } from "../controllers/authController";

const router = Router();

// 🔐 Ruta para login
router.post("/login", loginUsuario);

export default router;
