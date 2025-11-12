import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../config/database";

const SECRET = process.env.JWT_SECRET || "mi_clave_secreta";

export const loginUsuario = async (req: Request, res: Response) => {
  const { correo, contrasena } = req.body;

  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [correo]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ mensaje: "Usuario no encontrado" });
    }

    const passwordValida = await bcrypt.compare(contrasena, user.contrasena);
    if (!passwordValida) {
      return res.status(400).json({ mensaje: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id, correo: user.correo, rol: user.rol },
      SECRET,
      { expiresIn: "2h" }
    );

    res.json({
      token,
      usuario: {  // ← CAMBIO: user → usuario
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
};