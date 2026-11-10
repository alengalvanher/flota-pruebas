import { test, expect } from '@playwright/test';
import { usuarios } from '../../config/usuarios';
import { loginApi } from '../../fixtures/sesion';

/** Humo: cada usuario de prueba entra por la API de Usuarios y trae sus roles. */
test.describe('@humo Login por API', () => {
  for (const u of usuarios) {
    test(`${u.clave} obtiene token y sus roles`, async ({ request }) => {
      const res = await loginApi(request, u.correo);
      expect(res.status(), `login de ${u.correo}`).toBe(200);

      const body = await res.json();
      expect(body.token, 'token JWT').toBeTruthy();

      const roles: string[] = (body.roles ?? []).map((r: { name: string }) => r.name);
      expect(roles.sort()).toEqual([...u.roles].sort());
      expect(body.modules?.length ?? 0, 'módulos asignados').toBeGreaterThan(0);
    });
  }

  test('contraseña incorrecta regresa 401', async ({ request }) => {
    const res = await loginApi(request, usuarios[0].correo, 'contrasena-equivocada');
    expect(res.status()).toBe(401);
  });
});
