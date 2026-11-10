import 'dotenv/config';

/** Servicios del entorno local; deben coincidir con Flotas/flotas.config.json. */
export const servicios = {
  usuariosApi: { titulo: 'API de Usuarios', url: process.env.URL_USUARIOS_API ?? 'https://localhost:7232' },
  flotaApi: { titulo: 'API de Flota', url: process.env.URL_FLOTA_API ?? 'http://localhost:51036' },
  checklistApi: { titulo: 'API de CheckList', url: process.env.URL_CHECKLIST_API ?? 'https://localhost:50053' },
  neumaticosApi: { titulo: 'API de Neumáticos', url: process.env.URL_NEUMATICOS_API ?? 'https://localhost:7193' },
  portal: { titulo: 'Portal web de Flota', url: process.env.URL_PORTAL ?? 'https://localhost:4200' },
  checklistApp: { titulo: 'App de CheckList', url: process.env.URL_CHECKLIST_APP ?? 'http://localhost:8100' },
  neumaticosApp: { titulo: 'App de Neumáticos', url: process.env.URL_NEUMATICOS_APP ?? 'http://localhost:8101' },
} as const;

export const apis = [servicios.usuariosApi, servicios.flotaApi, servicios.checklistApi, servicios.neumaticosApi];
export const apps = [servicios.portal, servicios.checklistApp, servicios.neumaticosApp];

// Candado: estas pruebas solo corren contra máquinas locales, nunca contra Azure ni gpfleet.
for (const s of Object.values(servicios)) {
  const host = new URL(s.url).hostname;
  if (!['localhost', '127.0.0.1'].includes(host)) {
    throw new Error(`${s.titulo} apunta a ${s.url}. Las pruebas solo corren contra localhost.`);
  }
}
