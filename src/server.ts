import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';
import { testConnection } from './config/database';

import estudianteRouter from './routes/estudianteRouter';
import userRouter from './routes/userRouter';
import catalogoRouter from './routes/catalogoRouter';
import authRouter from './routes/authRouter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware global
app.use(cors({
  origin: "http://localhost:4200",
  credentials: true,
  exposedHeaders: ["Authorization"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

// Rutas
app.use('/api/auth', authRouter);
app.use('/api/usuarios', userRouter);
app.use('/api/estudiantes', estudianteRouter);
app.use('/api/catalogos', catalogoRouter);

// 404
app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

// Server start
const startServer = async () => {
  try {
    await testConnection();
    app.listen(PORT, () => console.log(`🚀 Servidor corriendo en puerto ${PORT}`));
  } catch (error) {
    console.error('Error iniciando servidor:', error);
    process.exit(1);
  }
};

startServer();
