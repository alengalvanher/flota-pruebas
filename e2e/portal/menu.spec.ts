import fs from 'node:fs';
import { test, expect } from '@playwright/test';
import { usuarios } from '../../config/usuarios';
import { ARCHIVO_PANTALLAS, leerPantallas, MenuPorRol, Pantalla } from '../../config/pantallas';
import { archivoMenu } from '../../fixtures/portal';

/**
 * El menú lateral que el portal le dibuja a cada rol (lo lee el setup), comparado contra
 * config/pantallas.json. `npm run menu` (--update-snapshots) lo vuelve a guardar.
 */
test.describe('@lectura Menú del portal por rol', () => {
  test.describe.configure({ mode: 'serial' });
  const vivo: MenuPorRol = {};
  const guardado = leerPantallas();
  let actualizar = false;

  for (const u of usuarios) {
    test(`${u.clave}: el menú coincide con config/pantallas.json`, async () => {
      actualizar = !guardado || ['all', 'changed'].includes(test.info().config.updateSnapshots);
      vivo[u.clave] = JSON.parse(fs.readFileSync(archivoMenu(u.clave), 'utf8')) as Pantalla[];
      expect(vivo[u.clave].length, 'pantallas en el menú').toBeGreaterThan(0);

      if (actualizar) return;
      expect(vivo[u.clave], 'el menú del rol cambió; si es correcto, corre npm run menu').toEqual(guardado![u.clave]);
    });
  }

  test.afterAll(() => {
    if (actualizar && Object.keys(vivo).length === usuarios.length) {
      fs.writeFileSync(ARCHIVO_PANTALLAS, JSON.stringify(vivo, null, 2) + '\n');
    }
  });
});
