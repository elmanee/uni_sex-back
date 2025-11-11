import { Request, Response } from 'express';
import { query } from '../config/database';
import { generarMatricula } from '../services/matriculaService';
import { enviarBienvenida } from '../services/emailService';
import { moverArchivos, uploadArchivos } from '../services/archivoService';
import { Estudiante } from '../models/Estudiante';
import path from 'path';
import fs from "fs";




// ========================
// REGISTRAR ESTUDIANTE
// ========================
export const registrarEstudiante = async (req: Request, res: Response): Promise<void> => {
  try {
    const datos: Estudiante = req.body;
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };

    if (!files?.foto || !files?.certificado || !files?.comprobante) {
      res.status(400).json({ error: 'Faltan archivos requeridos' });
      return;
    }

    const matricula = generarMatricula(
      datos.apellido_paterno,
      datos.apellido_materno,
      datos.nombre
    );

    if (req.body._tempFolder) moverArchivos(req.body._tempFolder, matricula);

    const foto_url = `/uploads/${matricula}/${files.foto[0]?.filename}`;
    const certificado_url = `/uploads/${matricula}/${files.certificado[0]?.filename}`;
    const comprobante_url = `/uploads/${matricula}/${files.comprobante[0]?.filename}`;

    const queryText = `
      INSERT INTO estudiantes (
        matricula, nombre, apellido_paterno, apellido_materno,
        calle, numero, colonia, ciudad, estado, codigo_postal,
        telefono_casa, telefono_estudiante, telefono_tutor, email,
        bachillerato_id, promedio, especialidad_id, carrera_id,
        nombre_madre, apellido_paterno_madre, apellido_materno_madre,
        nombre_padre, apellido_paterno_padre, apellido_materno_padre,
        foto_url, certificado_url, comprobante_domicilio_url
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,
        $19,$20,$21,$22,$23,$24,$25,$26,$27
      ) RETURNING *;
    `;

    const values = [
      matricula,
      datos.nombre,
      datos.apellido_paterno,
      datos.apellido_materno,
      datos.calle,
      datos.numero,
      datos.colonia,
      datos.ciudad,
      datos.estado,
      datos.codigo_postal,
      datos.telefono_casa || null,
      datos.telefono_estudiante,
      datos.telefono_tutor,
      datos.email,
      datos.bachillerato_id,
      datos.promedio,
      datos.especialidad_id,
      datos.carrera_id,
      datos.nombre_madre || null,
      datos.apellido_paterno_madre || null,
      datos.apellido_materno_madre || null,
      datos.nombre_padre || null,
      datos.apellido_paterno_padre || null,
      datos.apellido_materno_padre || null,
      foto_url,
      certificado_url,
      comprobante_url,
    ];

    const result = await query(queryText, values);
    const estudiante = result.rows[0];

    await enviarBienvenida(
      datos.email,
      matricula,
      `${datos.nombre} ${datos.apellido_paterno} ${datos.apellido_materno}`
    );

    res.status(201).json({
      success: true,
      message: 'Estudiante registrado exitosamente',
      data: estudiante,
    });
  } catch (error: any) {
    if (error.code === '23505') {
      res.status(400).json({ error: 'El email o matrícula ya existe' });
    } else {
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

// ========================
// OBTENER TODOS LOS ESTUDIANTES
// ========================
export const obtenerEstudiantes = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await query('SELECT * FROM estudiantes ORDER BY fecha_registro DESC;');
    res.status(200).json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener estudiantes' });
  }
};

// ========================
// OBTENER ESTUDIANTE POR MATRÍCULA
// ========================
export const obtenerEstudiantePorMatricula = async (req: Request, res: Response): Promise<void> => {
  try {
    const { matricula } = req.params;
    const result = await query('SELECT * FROM estudiantes WHERE matricula = $1;', [matricula]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Estudiante no encontrado' });
      return;
    }

    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener estudiante' });
  }
};

// ========================
// ACTUALIZAR ESTUDIANTE (PATCH)
// ========================
export const actualizarEstudiante = async (req: Request, res: Response): Promise<void> => {
  try {
    const { matricula } = req.params;
    const datos: Partial<Estudiante> = req.body || {};
    const files = (req.files as { [fieldname: string]: Express.Multer.File[] }) || {};

    // Limpiar campos no válidos
    delete (datos as any)._tempFolder;
    delete (datos as any).id;
    delete (datos as any).matricula;

    const carpetaDestino = path.join("uploads", matricula);
    let archivosNuevos: string[] = [];
    let tempFolder: string | null = null;

    // Detectar archivos nuevos y carpeta temporal
    if (files && Object.keys(files).length > 0) {
      if (files.foto?.[0]) archivosNuevos.push("foto");
      if (files.certificado?.[0]) archivosNuevos.push("certificado");
      if (files.comprobante?.[0]) archivosNuevos.push("comprobante");

      const rutaArchivoEjemplo =
        files.foto?.[0]?.path ||
        files.certificado?.[0]?.path ||
        files.comprobante?.[0]?.path;

      if (rutaArchivoEjemplo) {
        const detectedTemp = rutaArchivoEjemplo.split(path.sep).slice(-2, -1)[0];
        if (detectedTemp && detectedTemp.startsWith("TEMP_")) {
          tempFolder = detectedTemp;
        }
      }
    }

    // Eliminar archivos viejos antes de mover los nuevos
    if (fs.existsSync(carpetaDestino) && archivosNuevos.length > 0) {
      const archivosExistentes = fs.readdirSync(carpetaDestino);
      archivosNuevos.forEach((tipo) => {
        const prefijo = tipo === "comprobante" ? "comprobante" : tipo;
        const aBorrar = archivosExistentes.filter((f) => f.startsWith(prefijo));
        if (aBorrar.length > 0) {
          aBorrar.forEach((f) => fs.unlinkSync(path.join(carpetaDestino, f)));
        }
      });
    }

    // Mover los archivos nuevos
    if (tempFolder) {
      await moverArchivos(tempFolder, matricula);
    }

    // Actualizar rutas en BD
    if (files?.foto?.[0]) {
      datos.foto_url = `/${path.posix.join("uploads", matricula, files.foto[0].filename)}`;
    }
    if (files?.certificado?.[0]) {
      datos.certificado_url = `/${path.posix.join("uploads", matricula, files.certificado[0].filename)}`;
    }
    if (files?.comprobante?.[0]) {
      datos.comprobante_domicilio_url = `/${path.posix.join("uploads", matricula, files.comprobante[0].filename)}`;
    }

    // Construir query dinámico
    const campos = Object.keys(datos || {});
    const valores = Object.values(datos || {});

    if (campos.length === 0) {
      res.status(400).json({ error: "No se enviaron campos para actualizar" });
      return;
    }

    const setQuery = campos.map((campo, i) => `${campo} = $${i + 1}`).join(", ");
    const queryText = `UPDATE estudiantes SET ${setQuery} WHERE matricula = $${campos.length + 1} RETURNING *;`;

    const result = await query(queryText, [...valores, matricula]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: "Estudiante no encontrado" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Estudiante actualizado correctamente",
      data: result.rows[0],
    });
  } catch (error: any) {
    res.status(500).json({ error: "Error al actualizar estudiante" });
  }
};



// ========================
// OBTENER CATÁLOGOS
// ========================
export const obtenerCatalogo = async (req: Request, res: Response): Promise<void> => {
  try {
    const { tipo } = req.params;
    let queryText = '';

    switch (tipo) {
      case 'bachilleratos':
        queryText = 'SELECT * FROM bachilleratos ORDER BY nombre';
        break;
      case 'especialidades':
        queryText = 'SELECT * FROM especialidades ORDER BY nombre';
        break;
      case 'carreras':
        queryText = 'SELECT * FROM carreras ORDER BY nombre';
        break;
      default:
        res.status(400).json({ error: 'Tipo de catálogo inválido' });
        return;
    }

    const result = await query(queryText);
    res.status(200).json({ success: true, data: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};