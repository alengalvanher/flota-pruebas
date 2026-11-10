import { test, expect } from '@playwright/test';
import { usuarios } from '../../config/usuarios';
import { loginPortal } from '../../fixtures/sesion';

/** Humo: cada rol entra al portal web de Flota por la pantalla de login. */
test.describe('@humo Login en el portal', () => {
  for (const u of usuarios) {
    test(`${u.clave} entra al portal`, async ({ page }) => {
      const erroresConsola: string[] = [];
      page.on('pageerror', (e) => erroresConsola.push(e.message));

      await loginPortal(page, u);
      await page.waitForLoadState('networkidle');

      await test.info().attach(`portal-${u.clave}.png`, {
        body: await page.screenshot({ fullPage: false }),
        contentType: 'image/png',
      });
      expect(erroresConsola, 'errores de JavaScript en la página').toEqual([]);
    });
  }
});
