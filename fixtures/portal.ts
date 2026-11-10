import fs from 'node:fs';
import path from 'node:path';
import { Page, expect, test } from '@playwright/test';
import { servicios } from '../config/entorno';
import { Pantalla } from '../config/pantallas';
import { prepararPagina, revisarCompilacion } from './sesion';

const DIR_AUTH = path.join(__dirname, '..', '.auth');
fs.mkdirSync(DIR_AUTH, { recursive: true });

export const archivoSesion = (clave: string) => path.join(DIR_AUTH, `${clave}.json`);
export const archivoInicio = (clave: string) => path.join(DIR_AUTH, `${clave}.inicio.txt`);
export const archivoMenu = (clave: string) => path.join(DIR_AUTH, `${clave}.menu.json`);

export function leerInicio(clave: string): string {
  return fs.existsSync(archivoInicio(clave)) ? fs.readFileSync(archivoInicio(clave), 'utf8').trim() : '';
}

/**
 * Lee el menú lateral tal como el portal se lo dibuja al rol. Usa `ng.getComponent`, que
 * Angular expone en modo desarrollo (ng serve), para tomar el `link` real de cada
 * `dnn-menu-item`. Lo que el rol no puede ver lo esconde `rolesVisible` con display:none.
 */
export async function leerMenuLateral(page: Page): Promise<Pantalla[]> {
  await page.locator('dnn-menu-item').first().waitFor();
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(1_500); // los permisos llegan después del primer pintado
  return page.evaluate(() => {
    const ng = (window as any).ng;
    if (!ng?.getComponent) throw new Error('El portal no expone `ng` (¿no es ng serve en modo desarrollo?)');
    const salida: { ruta: string; url: string }[] = [];
    for (const el of Array.from(document.querySelectorAll('dnn-menu-item'))) {
      const camino: string[] = [];
      let oculto = false;
      for (let e: Element | null = el; e; e = e.parentElement) {
        if (e.tagName !== 'DNN-MENU-ITEM') continue;
        if ((e as HTMLElement).style.display === 'none') { oculto = true; break; }
        camino.unshift(String(ng.getComponent(e)?.label ?? '').trim());
      }
      const link = ng.getComponent(el)?.link;
      if (!oculto && link) salida.push({ ruta: camino.join(' › '), url: link });
    }
    return salida;
  });
}

/**
 * Abre una pantalla del portal con la sesión ya puesta y revisa que cargue limpia:
 * sin errores de JavaScript, sin llamadas a API con 4xx/5xx, sin perder la sesión y
 * sin que el portal la mande al inicio (ruta inexistente).
 */
export async function revisarPantalla(page: Page, url: string, inicio: string) {
  const erroresJs: string[] = [];
  const apisConError: string[] = [];
  const consola: string[] = [];

  page.on('pageerror', (e) => erroresJs.push(e.message.split('\n')[0]));
  page.on('console', (m) => { if (m.type() === 'error') consola.push(m.text().slice(0, 300)); });
  page.on('response', (r) => {
    const llamada = new URL(r.url());
    if (llamada.pathname.startsWith('/api/') && r.status() >= 400) {
      apisConError.push(`${r.status()} ${r.request().method()} ${llamada.pathname}`);
    }
  });

  await prepararPagina(page);
  await page.goto(`${servicios.portal.url}${url}`);
  await revisarCompilacion(page);
  await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
  await page.waitForTimeout(1_000);

  const final = new URL(page.url()).pathname;
  await test.info().attach('pantalla.png', { body: await page.screenshot(), contentType: 'image/png' });
  if (consola.length) await test.info().attach('consola.txt', { body: consola.join('\n'), contentType: 'text/plain' });

  expect(final, 'se perdió la sesión (mandó al login)').not.toMatch(/^\/auth/);
  if (url.toLowerCase() !== inicio.toLowerCase()) {
    expect.soft(final, `la ruta ${url} no existe en el portal (redirigió al inicio)`).not.toBe(inicio);
  }
  expect.soft(erroresJs, 'errores de JavaScript').toEqual([]);
  expect.soft([...new Set(apisConError)], 'llamadas a API con error').toEqual([]);
}
