import { Request, Response } from "express";
import { pool } from "../config/database";

export class CatalogoController {
  static async listar(req: Request, res: Response) {
    try {
      const { tipo } = req.params;

      const tablasValidas = ["carreras", "especialidades", "bachilleratos"];
      if (!tablasValidas.includes(tipo)) {
        return res.status(400).json({ success: false, message: "Tipo no válido" });
      }

      const result = await pool.query(`SELECT * FROM ${tipo} ORDER BY id ASC`);
      res.json({ success: true, data: result.rows });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async crear(req: Request, res: Response) {
    try {
      const { tipo } = req.params;
      const { nombre } = req.body;

      if (!tipo || !nombre) {
        return res.status(400).json({ success: false, message: "Datos insuficientes" });
      }

      const result = await pool.query(
        `INSERT INTO ${tipo} (nombre) VALUES ($1) RETURNING *`,
        [nombre]
      );
      res.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async actualizar(req: Request, res: Response) {
    try {
      const { tipo, id } = req.params;
      const { nombre } = req.body;

      const result = await pool.query(
        `UPDATE ${tipo} SET nombre = $1 WHERE id = $2 RETURNING *`,
        [nombre, id]
      );
      res.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async eliminar(req: Request, res: Response) {
    try {
      const { tipo, id } = req.params;
      await pool.query(`DELETE FROM ${tipo} WHERE id = $1`, [id]);
      res.json({ success: true, message: "Registro eliminado" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
