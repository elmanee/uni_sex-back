import {pool} from "../config/database";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User";
import dotenv from "dotenv";

dotenv.config();

const SECRET = process.env.JWT_SECRET || "mi_clave_secreta";

export class UserService {
  static async registrarUsuario(user: User) {
    const hashedPassword = await bcrypt.hash(user.contrasena, 10);
    const query = `
      INSERT INTO usuarios (nombre, correo, contrasena, rol)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre, correo, rol;
    `;
    const values = [user.nombre, user.correo, hashedPassword, user.rol || "usuario"];
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  static async login(correo: string, contrasena: string) {
    const result = await pool.query("SELECT * FROM usuarios WHERE correo = $1", [correo]);
    const user = result.rows[0];
    if (!user) throw new Error("Usuario no encontrado");

    const valid = await bcrypt.compare(contrasena, user.contrasena);
    if (!valid) throw new Error("Contraseña incorrecta");

    const token = jwt.sign({ id: user.id, rol: user.rol }, SECRET, { expiresIn: "2h" });
    return { token, user: { id: user.id, nombre: user.nombre, correo: user.correo, rol: user.rol } };
  }

  static async listarUsuarios() {
    const result = await pool.query("SELECT id, nombre, correo, rol, creado_en FROM usuarios ORDER BY id ASC");
    return result.rows;
  }
}
