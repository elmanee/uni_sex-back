import { Request, Response } from "express";
import { UserService } from "../services/userService";

export class UserController {
  static async registrar(req: Request, res: Response) {
    try {
      const nuevo = await UserService.registrarUsuario(req.body);
      res.json({ estatus: "OK", mensaje: "Usuario registrado correctamente", usuario: nuevo });
    } catch (error: any) {
      res.status(400).json({ estatus: "ERROR", mensaje: error.message });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { correo, contrasena } = req.body;
      const data = await UserService.login(correo, contrasena);
      res.json({ estatus: "OK", mensaje: "Inicio de sesión correcto", ...data });
    } catch (error: any) {
      res.status(401).json({ estatus: "ERROR", mensaje: error.message });
    }
  }

  static async listar(req: Request, res: Response) {
    try {
      const usuarios = await UserService.listarUsuarios();
      res.json({ estatus: "OK", lista: usuarios });
    } catch (error: any) {
      res.status(500).json({ estatus: "ERROR", mensaje: error.message });
    }
  }
}
