import { test, expect } from '@playwright/test';
import { apis, apps } from '../../config/entorno';

/** Humo: cada servicio del tablero está arriba y responde. */
test.describe('@humo Servicios arriba', () => {
  for (const api of apis) {
    test(`${api.titulo} responde su swagger`, async ({ request }) => {
      // El swagger UI vive en la raíz (RoutePrefix = ""); el JSON es lo más estable para revisar.
      const res = await request.get(`${api.url}/swagger/v1/swagger.json`, { failOnStatusCode: false }).catch((e) => {
        throw new Error(`${api.titulo} no contesta en ${api.url}. ¿Está levantado en el tablero? (${e.message})`);
      });
      expect(res.status(), `${api.titulo} en ${api.url}`).toBe(200);
      const doc = await res.json();
      expect(Object.keys(doc.paths ?? {}).length, 'endpoints publicados').toBeGreaterThan(0);
    });
  }

  for (const app of apps) {
    test(`${app.titulo} sirve su página`, async ({ request }) => {
      const res = await request.get(app.url, { failOnStatusCode: false }).catch((e) => {
        throw new Error(`${app.titulo} no contesta en ${app.url}. ¿Está levantada en el tablero? (${e.message})`);
      });
      expect(res.status(), `${app.titulo} en ${app.url}`).toBe(200);
      expect(await res.text()).toMatch(/<(app-root|ion-app)/);
    });
  }
});
