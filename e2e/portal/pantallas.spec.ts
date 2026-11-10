import { test } from '@playwright/test';
import { usuarios } from '../../config/usuarios';
import { leerPantallas, pantallasAVisitar } from '../../config/pantallas';
import { archivoSesion, leerInicio, revisarPantalla } from '../../fixtures/portal';

/** Lectura: cada pantalla del menú de cada rol carga sin errores. No hace clic en nada que guarde. */
const menu = leerPantallas();

if (!menu) {
  test('@lectura falta config/pantallas.json', () => {
    throw new Error('Corre primero: npm run menu');
  });
}

for (const u of usuarios) {
  test.describe(`@lectura Portal · ${u.clave}`, () => {
    test.use({ storageState: archivoSesion(u.clave) });

    for (const p of pantallasAVisitar(menu?.[u.clave] ?? [])) {
      test(`${p.rutas[0]}  [${p.url}]`, async ({ page }) => {
        test.skip(!!p.omitir, p.omitir);
        if (p.rutas.length > 1) test.info().annotations.push({ type: 'también en el menú como', description: p.rutas.slice(1).join(' | ') });
        await revisarPantalla(page, p.url, leerInicio(u.clave));
      });
    }
  });
}
