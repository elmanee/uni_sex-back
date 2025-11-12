export interface User {
  id?: number;
  nombre: string;
  correo: string;
  contrasena: string;
  rol?: string;
  creado_en?: Date;
}
