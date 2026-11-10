import 'dotenv/config';

export interface UsuarioPrueba {
  clave: string;
  correo: string;
  /** Roles que debe regresar el login (nombres tal cual vienen de la base). */
  roles: string[];
}

const dominio = '@kubus-tech.com.mx';
const correo = (clave: string) => `alen.galvan+${clave}${dominio}`;

/** Usuarios de prueba de FlotasDev, uno por rol. */
export const usuarios: UsuarioPrueba[] = [
  { clave: 'liderflota', correo: correo('liderflota'), roles: ['Líder de flota'] },
  { clave: 'adminneumaticos', correo: correo('adminneumaticos'), roles: ['Administrador de neumáticos'] },
  { clave: 'liderregional', correo: correo('liderregional'), roles: ['Líder Regional', 'Regional', 'Regional dinamico'] },
  { clave: 'mecanico', correo: correo('mecanico'), roles: ['Mecánico'] },
  { clave: 'almacen', correo: correo('almacen'), roles: ['Almacenista'] },
  { clave: 'compras', correo: correo('compras'), roles: ['Compras', 'Compras dinamico'] },
];

export function contrasena(): string {
  const pw = process.env.PRUEBAS_PASSWORD;
  if (!pw) throw new Error('Falta PRUEBAS_PASSWORD en el archivo .env (ver .env.example).');
  return pw;
}
