import fs from 'node:fs';
import { test as setup } from '@playwright/test';
import { usuarios } from '../config/usuarios';
import { loginPortal } from '../fixtures/sesion';
import { archivoInicio, archivoMenu, archivoSesion, leerMenuLateral } from '../fixtures/portal';

/**
 * Cada rol entra una vez al portal. Se guardan su sesión (la reusan todas sus pruebas),
 * la página a la que llega y el menú lateral que el portal le dibuja.
 */
for (const u of usuarios) {
  setup(`sesión de ${u.clave}`, async ({ page }) => {
    await loginPortal(page, u);
    await page.waitForLoadState('networkidle', { timeout: 20_000 }).catch(() => {});
    await page.context().storageState({ path: archivoSesion(u.clave) });
    // Si una pantalla redirige aquí, su ruta no existe o el rol no tiene permiso.
    fs.writeFileSync(archivoInicio(u.clave), new URL(page.url()).pathname);
    fs.writeFileSync(archivoMenu(u.clave), JSON.stringify(await leerMenuLateral(page), null, 2));
  });
}
