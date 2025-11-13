import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// 🔐 Extender la interfaz Request para incluir el usuario
declare global {
  namespace Express {
    interface Request {
      usuario?: {
        id: number;
        correo: string;
        rol: string;
      };
    }
  }
}

/**
 * 🔒 Middleware para verificar el token JWT
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // 1️⃣ Obtener el token del header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log('🔍 Auth Header:', authHeader);
    console.log('🔑 Token extraído:', token ? '✅ Sí' : '❌ No');

    // 2️⃣ Si no hay token, retornar error 401
    if (!token) {
      res.status(401).json({
        status: 'ERROR',
        mensaje: 'Token no proporcionado'
      });
      return;
    }

    // 3️⃣ Verificar el token con la clave secreta
    const JWT_SECRET = process.env.JWT_SECRET || 'mi_clave_secreta';

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('❌ Error al verificar token:', err.message);
        res.status(403).json({
          status: 'ERROR',
          mensaje: 'Token inválido o expirado'
        });
        return;
      }

      // 4️⃣ Token válido - agregar usuario al request
      req.usuario = decoded as {
        id: number;
        correo: string;
        rol: string;
      };

      console.log('✅ Token válido. Usuario:', req.usuario?.correo);

      // 5️⃣ Continuar con la siguiente función
      next();
    });
  } catch (error) {
    console.error('❌ Error en middleware de autenticación:', error);
    res.status(500).json({
      status: 'ERROR',
      mensaje: 'Error en la autenticación'
    });
  }
};

/**
 * 👮 Middleware para verificar roles específicos
 */
export const authorizeRoles = (...rolesPermitidos: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({
        status: 'ERROR',
        mensaje: 'Usuario no autenticado'
      });
      return;
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      res.status(403).json({
        status: 'ERROR',
        mensaje: 'No tienes permisos para realizar esta acción'
      });
      return;
    }

    next();
  };
};