import fs from 'node:fs';
import path from 'node:path';

export interface Pantalla {
  /** Camino en el menú lateral, p. ej. "Mantenimiento › Agenda". */
  ruta: string;
  url: string;
}

export type MenuPorRol = Record<string, Pantalla[]>;

/**
 * Foto del menú lateral que el portal le dibuja a cada rol. Se genera con `npm run menu`
 * y se versiona: si un permiso cambia, la prueba del menú lo marca.
 *
 * Ojo: NO sale del `urlModulo` que regresa el login. El portal no usa ese campo para
 * navegar (arma el menú con super-routes.config.ts + permisos) y en la base hay URLs
 * viejas que ya no existen.
 */
export const ARCHIVO_PANTALLAS = path.join(__dirname, 'pantallas.json');

export interface PantallaAVisitar {
  url: string;
  /** Todas las entradas del menú que llevan a esta URL. */
  rutas: string[];
  /** Si trae parámetros (`:id`) no se puede abrir directo. */
  omitir?: string;
}

/** Agrupa las entradas del menú por URL: cada URL se visita una vez. */
export function pantallasAVisitar(pantallas: Pantalla[]): PantallaAVisitar[] {
  const porUrl = new Map<string, PantallaAVisitar>();
  for (const p of pantallas) {
    const previa = porUrl.get(p.url);
    if (previa) { previa.rutas.push(p.ruta); continue; }
    porUrl.set(p.url, {
      url: p.url,
      rutas: [p.ruta],
      omitir: p.url.includes('/:') ? 'la URL lleva parámetros; se prueba desde su listado' : undefined,
    });
  }
  return [...porUrl.values()];
}

export function leerPantallas(): MenuPorRol | null {
  if (!fs.existsSync(ARCHIVO_PANTALLAS)) return null;
  return JSON.parse(fs.readFileSync(ARCHIVO_PANTALLAS, 'utf8'));
}
