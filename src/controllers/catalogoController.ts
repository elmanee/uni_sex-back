import { Request, Response } from "express";
import { pool } from "../config/database";

export class CatalogoController {
  // 🔹 LISTAR
  static async listar(req: Request, res: Response) {
    try {
      const { tipo } = req.params;

      const tablasValidas = ["carreras", "especialidades", "bachilleratos"];
      if (!tablasValidas.includes(tipo))
        return res.status(400).json({ success: false, message: "Tipo no válido" });

      const result = await pool.query(`SELECT * FROM ${tipo} ORDER BY id ASC`);
      res.json({ success: true, data: result.rows });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 🔹 CREAR
  static async crear(req: Request, res: Response) {
    try {
      const { tipo } = req.params;
      const body = req.body;

      if (!tipo)
        return res.status(400).json({ success: false, message: "Tipo requerido" });

      const tablasValidas = ["carreras", "especialidades", "bachilleratos"];
      if (!tablasValidas.includes(tipo))
        return res.status(400).json({ success: false, message: "Tipo no válido" });

      let query = "";
      let values: any[] = [];

      if (tipo === "carreras") {
        const { nombre, duracion_semestres } = body;
        if (!nombre || !duracion_semestres)
          return res.status(400).json({ success: false, message: "Faltan nombre o duración" });

        query = `INSERT INTO carreras (nombre, duracion_semestres) VALUES ($1, $2) RETURNING *`;
        values = [nombre, duracion_semestres];
      }

      else if (tipo === "bachilleratos") {
        const { nombre, tipo: tipoBach } = body;
        if (!nombre || !tipoBach)
          return res.status(400).json({ success: false, message: "Faltan nombre o tipo" });

        query = `INSERT INTO bachilleratos (nombre, tipo) VALUES ($1, $2) RETURNING *`;
        values = [nombre, tipoBach];
      }

      else if (tipo === "especialidades") {
        const { nombre } = body;
        if (!nombre)
          return res.status(400).json({ success: false, message: "Falta el nombre" });

        query = `INSERT INTO especialidades (nombre) VALUES ($1) RETURNING *`;
        values = [nombre];
      }

      const result = await pool.query(query, values);
      res.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
      console.error("❌ Error en crear catálogo:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 🔹 ACTUALIZAR
  static async actualizar(req: Request, res: Response) {
    try {
      const { tipo, id } = req.params;
      const body = req.body;

      const tablasValidas = ["carreras", "especialidades", "bachilleratos"];
      if (!tablasValidas.includes(tipo))
        return res.status(400).json({ success: false, message: "Tipo no válido" });

      let query = "";
      let values: any[] = [];

      if (tipo === "carreras") {
        const { nombre, duracion_semestres } = body;
        if (!nombre || !duracion_semestres)
          return res.status(400).json({ success: false, message: "Faltan nombre o duración" });

        query = `UPDATE carreras SET nombre = $1, duracion_semestres = $2 WHERE id = $3 RETURNING *`;
        values = [nombre, duracion_semestres, id];
      }

      else if (tipo === "bachilleratos") {
        const { nombre, tipo: tipoBach } = body;
        if (!nombre || !tipoBach)
          return res.status(400).json({ success: false, message: "Faltan nombre o tipo" });

        query = `UPDATE bachilleratos SET nombre = $1, tipo = $2 WHERE id = $3 RETURNING *`;
        values = [nombre, tipoBach, id];
      }

      else if (tipo === "especialidades") {
        const { nombre } = body;
        if (!nombre)
          return res.status(400).json({ success: false, message: "Falta el nombre" });

        query = `UPDATE especialidades SET nombre = $1 WHERE id = $2 RETURNING *`;
        values = [nombre, id];
      }

      const result = await pool.query(query, values);
      res.json({ success: true, data: result.rows[0] });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // 🔹 ELIMINAR
  static async eliminar(req: Request, res: Response) {
    try {
      const { tipo, id } = req.params;

      const tablasValidas = ["carreras", "especialidades", "bachilleratos"];
      if (!tablasValidas.includes(tipo))
        return res.status(400).json({ success: false, message: "Tipo no válido" });

      await pool.query(`DELETE FROM ${tipo} WHERE id = $1`, [id]);
      res.json({ success: true, message: "Registro eliminado" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
