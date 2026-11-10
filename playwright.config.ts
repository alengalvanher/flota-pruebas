import { defineConfig } from '@playwright/test';
import 'dotenv/config';

/**
 * Pruebas de Flota Danone (Flota, Neumáticos, CheckList) contra el entorno LOCAL.
 * Los servicios se levantan desde el tablero (http://localhost:9000), no desde aquí.
 */
export default defineConfig({
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  workers: 4,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'reporte' }], ['json', { outputFile: 'reporte-json/resultados.json' }]],
  outputDir: 'resultados',
  use: {
    // Los servicios locales usan certificados autofirmados de Kestrel / ASP.NET.
    ignoreHTTPSErrors: true,
    // Se usa el Chrome instalado: no hace falta descargar navegadores.
    channel: 'chrome',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'api', testDir: './api' },
    // Cada rol inicia sesión una vez; las pruebas de pantalla reusan esa sesión.
    { name: 'setup', testDir: './e2e', testMatch: /auth\.setup\.ts/ },
    { name: 'e2e', testDir: './e2e', dependencies: ['setup'] },
  ],
});
