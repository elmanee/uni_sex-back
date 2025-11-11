import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!req.body._tempFolder) {
      req.body._tempFolder = `TEMP_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }
    const carpetaTemp = path.join(uploadsDir, req.body._tempFolder);
    if (!fs.existsSync(carpetaTemp)) {
      fs.mkdirSync(carpetaTemp, { recursive: true });
    }
    cb(null, carpetaTemp);
  },
  filename: (req, file, cb) => {
    const tipo = file.fieldname;
    const ext = path.extname(file.originalname);
    cb(null, `${tipo}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === 'foto') {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image\/(jpeg|jpg|png)/.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error('La foto debe ser JPG o PNG'));
  } else {
    const isPDF =
      file.mimetype === 'application/pdf' ||
      file.mimetype === 'application/x-pdf' ||
      path.extname(file.originalname).toLowerCase() === '.pdf';
    if (isPDF) cb(null, true);
    else cb(new Error('Certificado y comprobante deben ser PDF'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

export const uploadArchivos = upload.fields([
  { name: 'foto', maxCount: 1 },
  { name: 'certificado', maxCount: 1 },
  { name: 'comprobante', maxCount: 1 },
]);

export const moverArchivos = async (carpetaTemp: string, matricula: string): Promise<void> => {
  const carpetaOrigen = path.join("uploads", carpetaTemp);
  const carpetaDestino = path.join("uploads", matricula);

  console.log(`🚚 Moviendo archivos de ${carpetaOrigen} → ${carpetaDestino}`);

  try {
    // Crear destino si no existe
    if (!fs.existsSync(carpetaDestino)) {
      fs.mkdirSync(carpetaDestino, { recursive: true });
      console.log("📁 Carpeta destino creada:", carpetaDestino);
    }

    // Obtener lista de archivos
    const archivos = await fs.promises.readdir(carpetaOrigen);
    console.log("📦 Archivos encontrados:", archivos);

    // Mover cada archivo (usando await para garantizar orden)
    for (const archivo of archivos) {
      const origen = path.join(carpetaOrigen, archivo);
      const destino = path.join(carpetaDestino, archivo);

      await fs.promises.rename(origen, destino);
      console.log(`✅ Movido: ${archivo}`);
    }

    // Eliminar la carpeta temporal si ya no tiene nada
    await fs.promises.rmdir(carpetaOrigen).catch(() => {});
    console.log("🧹 Carpeta temporal eliminada:", carpetaOrigen);
  } catch (error) {
    console.error("❌ Error al mover archivos:", error);
  }
};
