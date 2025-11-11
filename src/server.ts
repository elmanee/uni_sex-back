import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import path from 'path';
import { testConnection } from './config/database';
import estudianteRouter from './routes/estudianteRouter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, './uploads')));

app.use('/api', estudianteRouter);

app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));

const startServer = async () => {
  try {
    await testConnection();
    app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
  } catch (error) {
    console.error('Error iniciando servidor:', error);
    process.exit(1);
  }
};

startServer();
