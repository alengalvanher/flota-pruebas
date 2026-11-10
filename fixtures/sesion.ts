import { APIRequestContext, Page, expect } from '@playwright/test';
import { servicios } from '../config/entorno';
import { contrasena, UsuarioPrueba } from '../config/usuarios';

const CAPA_WEBPACK = '#webpack-dev-server-client-overlay';

/** Login directo contra la API de Usuarios. Regresa la respuesta completa (token, roles, módulos...). */
export async function loginApi(request: APIRequestContext, correo: string, password = contrasena()) {
  return request.post(`${servicios.usuariosApi.url}/api/Accounts/login`, {
    data: { grant_type: 'password', username: correo, password },
  });
}

/**
 * Si `ng serve` compiló con errores, webpack pinta una capa encima de la página que tapa
 * todos los clics. Se detecta y se reporta el primer error, en vez de esperar al timeout.
 *
 * Con PORTAL_IGNORAR_COMPILACION=1 la capa se quita en cada carga y la prueba sigue: sirve
 * cuando el error está en una pantalla distinta a la que se prueba.
 */
export async function revisarCompilacion(page: Page) {
  await page.waitForLoadState('load');
  const capa = page.locator(CAPA_WEBPACK);
  if ((await capa.count()) === 0) return;
  if (process.env.PORTAL_IGNORAR_COMPILACION === '1') {
    await capa.evaluate((el) => el.remove()).catch(() => {});
    return;
  }
  const texto = (await page.frameLocator(CAPA_WEBPACK).locator('body').innerText().catch(() => ''))
    .split('\n').filter((l) => l.trim()).slice(0, 6).join('\n');
  throw new Error(`El portal compiló con errores (capa de webpack encima de la página):\n${texto}`);
}

/** Quita la capa de webpack cada vez que aparezca (también tras una recarga en caliente). */
export async function prepararPagina(page: Page) {
  if (process.env.PORTAL_IGNORAR_COMPILACION !== '1') return;
  await page.addInitScript((sel) => {
    new MutationObserver(() => document.querySelector(sel)?.remove())
      .observe(document, { childList: true, subtree: true });
  }, CAPA_WEBPACK);
}

/** Login por la pantalla del portal web de Flota. Termina cuando ya se ve el portal, no el formulario. */
export async function loginPortal(page: Page, usuario: UsuarioPrueba) {
  await prepararPagina(page);
  await page.goto(`${servicios.portal.url}/auth/login`);
  await revisarCompilacion(page);

  const password = page.locator('input[type=password]');
  await page.locator('input[type=email]').fill(usuario.correo);
  await password.fill(contrasena());

  const [respuesta] = await Promise.all([
    // El portal entra por su proxy: /api/FleetLogin/accounts/Login
    page.waitForResponse((r) => /\/accounts\/login/i.test(r.url()) && r.request().method() === 'POST'),
    page.getByRole('button', { name: 'INGRESAR' }).click(),
  ]);
  expect(respuesta.status(), `respuesta del login de ${usuario.correo}`).toBe(200);

  // Ya dentro: el formulario de login desaparece y la URL deja de ser /auth.
  await expect(password).toHaveCount(0, { timeout: 30_000 });
  await expect(page).not.toHaveURL(/\/auth(\/|$)/);
}
