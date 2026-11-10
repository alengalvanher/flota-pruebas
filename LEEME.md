# flotas-pruebas

Pruebas automáticas de Flota Danone: **Flota, Neumáticos y CheckList**, con
[Playwright](https://playwright.dev) y TypeScript.

Prueban los sistemas desde fuera, por sus APIs y sus pantallas, contra el entorno
**local**. No tocan el código de los repos.

## Antes de correr

1. Levanta los servicios desde el tablero (`C:\origami\Flotas\Tablero Flotas.cmd`).
2. Copia `.env.example` como `.env` y pon la contraseña de los usuarios de prueba.
3. `npm install` (solo la primera vez). Se usa el Chrome instalado, no hace falta
   descargar navegadores.

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run humo` | Pruebas rápidas: servicios arriba y login por rol |
| `npm run lectura` | Cada pantalla del menú de cada rol carga sin errores (~6 min) |
| `npm run menu` | Vuelve a guardar el menú de cada rol en `config/pantallas.json` (cuando cambian permisos a propósito) |
| `npm run api` | Solo pruebas de API |
| `npm run e2e` | Solo pruebas de pantalla |
| `npm run todo` | Todo |
| `npm run ui` | Modo visual: ves cada prueba correr y la repites |
| `npm run reporte` | Abre el reporte HTML de la última corrida, con capturas, video y traza de lo que falló |
| `npm run grabar` | Abre el portal y convierte tus clics en código de prueba |

## Estructura

```
api/        pruebas directas a las APIs
  humo/     servicios arriba + login por rol
e2e/        pruebas de pantalla con navegador
  auth.setup.ts   cada rol entra una vez; guarda sesión y menú en .auth/
  portal/         portal web de Flota (https://localhost:4200)
    menu.spec.ts      el menú de cada rol no cambió sin avisar
    pantallas.spec.ts cada pantalla del menú carga limpia
config/     URLs, usuarios de prueba y pantallas.json (menú por rol)
fixtures/   login, lectura del menú y revisión de pantallas
```

## Qué revisa la lectura de pantallas

El menú sale del **menú lateral que el portal dibuja** a cada rol (no del `urlModulo` que
regresa el login: el portal no lo usa y en la base hay URLs viejas). En cada pantalla:

- no hay errores de JavaScript;
- ninguna llamada a `/api/...` responde 4xx o 5xx;
- no se pierde la sesión;
- no redirige al inicio (ruta inexistente o sin permiso);
- se guarda una captura en el reporte.

Solo navega: no hace clic en nada que guarde datos.

## Reglas

- **Solo localhost.** `config/entorno.ts` detiene todo si una URL apunta a otro lado.
- **Por defecto solo se lee.** Las pruebas que escriban en FlotasDev se marcarán y
  limpiarán lo que crean.
- **Ninguna contraseña en el código.** Va en `.env`, que no se sube.

## Si el portal compila con errores

Si `ng serve` tiene un error, webpack pone una capa encima de la página y bloquea los
clics. Las pruebas lo detectan y muestran el error. Si el error está en una pantalla
distinta a la que pruebas, puedes seguir con:

```
PORTAL_IGNORAR_COMPILACION=1 npm run e2e
```
