import { Router } from "express";
import { UserController } from "../controllers/userController";

const router = Router();

router.post("/register", UserController.registrar);
router.post("/login", UserController.login);
router.get("/", UserController.listar);

export default router;
