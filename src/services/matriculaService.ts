export const generarMatricula = (
  apellidoPaterno: string,
  apellidoMaterno: string,
  nombre: string
): string => {
  const limpiar = (str: string): string => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toUpperCase()
      .trim();
  };

  const apPaterno = limpiar(apellidoPaterno).substring(0, 2).padEnd(2, 'X');
  const apMaterno = limpiar(apellidoMaterno).substring(0, 2).padEnd(2, 'X');
  const inicial = limpiar(nombre.split(' ')[0] || '').substring(0, 1) || 'X';

  const fecha = new Date();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const año = String(fecha.getFullYear()).substring(2, 4);

  return `${apPaterno}${apMaterno}${inicial}-${mes}${año}`;
};
