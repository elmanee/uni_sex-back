export interface Estudiante {
  id?: number;
  matricula?: string;

  nombre: string;
  apellido_paterno: string;
  apellido_materno: string;

  calle: string;
  numero: string;
  colonia: string;
  ciudad: string;
  estado: string;
  codigo_postal: string;

  telefono_casa?: string;
  telefono_estudiante: string;
  telefono_tutor: string;

  email: string;

  bachillerato_id: number;
  promedio: number;
  especialidad_id: number;
  carrera_id: number;

  nombre_madre?: string;
  apellido_paterno_madre?: string;
  apellido_materno_madre?: string;
  nombre_padre?: string;
  apellido_paterno_padre?: string;
  apellido_materno_padre?: string;

  foto_url?: string;
  certificado_url?: string;
  comprobante_domicilio_url?: string;

  fecha_registro?: Date;
}

export interface Catalogo {
  id: number;
  nombre: string;
}

export interface Bachillerato extends Catalogo {
  tipo?: string;
}

export interface Carrera extends Catalogo {
  duracion_semestres: number;
}
