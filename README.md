# Sync Pass

Proyecto React + Vite + TypeScript. Deploy en Vercel ✅. Auth con Auth0 (pendiente).

> Esta es la bitácora oficial paso a paso. Solo se agrega un paso cuando queda bien y verificado.

## Stack actual (verificado 2026-10-13)

- Node: v24.15.0 / npm: 11.12.1
- React: ^19.2.8 + react-dom ^19.2.8
- Vite: ^8.3.0 (build verificado en 8.3.4)
- TypeScript: ~6.0.2
- Plugin: @vitejs/plugin-react ^6.1.1
- Lint: oxlint ^1.81.0

## Cómo correr en local

```bash
npm install
npm run dev      # desarrollo con HMR -> http://localhost:5173
npm run build    # tsc -b && vite build -> genera dist/
npm run preview  # previsualiza el build
npm run lint     # oxlint
```

## Bitácora paso a paso

### Paso 1: Proyecto base React + Vite + TS ✅ HECHO

**Fecha:** 2026-10-13
**Objetivo:** partir de template Vite React-TS funcional y dejarlo corriendo + compilando.

**Qué había:**
- Scaffold Vite (`citt@0.0.0`, `type: module`) con `src/main.tsx` -> `src/App.tsx`, `index.html` con `<div id="root">`, `vite.config.ts` con `plugins: [react()]`.
- Scripts en `package.json:6-11`: `dev: vite`, `build: tsc -b && vite build`, `lint: oxlint`, `preview: vite preview`.
- Cambios propios vs template original (commit `2f1c419 feat: v0.0.1` + working tree):
  - `README.md` reemplazado por `Sync Pass` + roadmap Vercel/Auth0.
  - `.gitignore` + `.private/` para secretos locales no versionados.

**Qué se hizo en esta sesión:**
1. Se inspeccionó estructura: `index.html`, `src/`, `package.json`, `vite.config.ts`.
2. Se verificó compilación limpia.

**Verificación (exitosa):**
```bash
npm run build
# vite v8.3.4 building client environment for production...
# ✓ 20 modules transformed.
# dist/index.html 0.45 kB, dist/assets/index-CVtPK4EU.js 222.44 kB
# ✓ built in 420ms
```

**Errores comunes:**
- `tsc -b` falla -> revisar `tsconfig.app.json` / tipos en `src/`.
- Puerto 5173 ocupado -> Vite propone otro automáticamente o usar `vite --port 5174`.

---

### Paso 2: Deploy en Vercel ✅ HECHO

**Fecha:** 2026-10-13
**Objetivo:** publicar `main` en Vercel con deploy automático por push.

**Configuración usada (presets Vite):**
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**Verificación (exitosa):**
```bash
curl -s -o /dev/null -w "%{http_code}\n" -L "https://citt-sync-pass-front.vercel.app/"
# 200
# HTML contiene el bundle del build local:
# /assets/index-CVtPK4EU.js + /assets/index-D64VDMd1.css + <div id="root">
```

**Cuando quede bien, anotar aquí:**
- URL prod: https://citt-sync-pass-front.vercel.app/
- Commit: `2f1c419 feat: v0.0.1` (2026-10-13) + working tree (`README.md`, `.gitignore` con `.private/`)
- Fecha: 2026-10-13
- Nota: primera URL entregada (`...8o9a1uwwc...vercel.app`) tenía Deployment Protection con redirect a `vercel.com/login`, se descartó y se validó la de producción.

---

### Paso 3: Auth con Auth0 ✅ HECHO (login funcional en local, falta verificar en prod)

**Fecha:** 2026-10-13
**Objetivo:** integrar React Quickstart de Auth0 (login/signup/logout + perfil).

**Config Auth0 Dashboard (por ti):**
- Application Origin: `https://citt-sync-pass-front.vercel.app`
- Callback URL: `https://citt-sync-pass-front.vercel.app/`
- Logout URL: `https://citt-sync-pass-front.vercel.app/`
- Web Origin: `https://citt-sync-pass-front.vercel.app/`
- Domain: `dev-qd6i88udlr5yzjtv.us.auth0.com`

**Qué se hizo:**
1. Instalación:
```bash
npm install @auth0/auth0-react@2.x
# instalado: @auth0/auth0-react ^2.28.2
```
2. `src/main.tsx`: envuelto `<App />` en `<Auth0Provider domain clientId authorizationParams={{ redirect_uri: window.location.origin }}>`. Se adaptó import de `./App.jsx` a `./App.tsx` y se mantuvo `./index.css`.
3. `src/App.tsx`: reemplazado demo Vite por flujo `useAuth0()` (`isLoading`, `isAuthenticated`, `loginWithRedirect`, `logout`, `user`, `error`). Ajustes TS:
   - `user?.email` por `User | undefined`.
   - `onClick={() => login()}` en Login (evita error TS2322: `RedirectLoginOptions` vs `MouseEvent`).

**Verificación (exitosa local):**
```bash
npm run build
# ✓ 17 modules transformed.
# dist/assets/index-BcVsr2Ll.js 450.37 kB
# ✓ built in 86ms
npm run lint
# oxlint sin errores
```

**Errores típicos:**
- `Callback URL mismatch` (2026-10-13, en prod): Auth0 compara exacto. La app envía `window.location.origin` (sin `/` final). Fix: en **Allowed Callback URLs** registrar con y sin slash, para prod y local:
  - `https://citt-sync-pass-front.vercel.app` + `https://citt-sync-pass-front.vercel.app/`
  - `http://localhost:5173` + `http://localhost:5173/`
  - Lo mismo en **Allowed Logout URLs** y **Allowed Web Origins**.
- Aviso `Dev Keys` (2026-10-13): la conexión social usaba credenciales de prueba de Auth0. Fix: **Applications → tu app → Connections** → desactivar la conexión social (se usa solo email + password). Si a futuro se quiere Google real, crear OAuth Client ID propio en Google Cloud Console y pegarlo en **Authentication → Social → Google**.

**Pendiente para ✅ total:**
- Push -> Vercel redeploy -> probar Signup/Login/Logout en `https://citt-sync-pass-front.vercel.app/` y confirmar `redirect_uri` + logout `returnTo` vuelven al origen.

---

### Paso 4: Auth0 centralizado en `src/config.ts` ✅ HECHO

**Fecha:** 2026-10-13
**Objetivo:** sacar `domain`/`clientId` de `src/main.tsx` a un archivo de config en duro (los envs de Vercel son de pago en el plan actual, se descarta `.env`).

**Qué se hizo:**
1. Nuevo `src/config.ts` con `AUTH0_DOMAIN` y `AUTH0_CLIENT_ID` exportados.
2. `src/main.tsx`: importa desde `./config.ts` (revirtió el intento con `import.meta.env` + `.env.example`/`.env.local`, archivos eliminados).
3. Sin config extra en Vercel: el deploy funciona tal cual con `npm run build` -> `dist/`.

**Verificación (exitosa local):**
```bash
npm run build
# ✓ 18 modules transformed.
# ✓ built in 92ms
npm run lint
# oxlint sin errores
```

**Nota:** `domain` + `clientId` son valores públicos de SPA (quedan visibles en el JS), no son secretos. Nunca poner un `clientSecret` en el frontend.

**Pendiente para ✅ total del Auth0:**
- Push -> Vercel redeploy -> probar Signup/Login/Logout en `https://citt-sync-pass-front.vercel.app/`.

---

### Paso 5: Roles y permisos 📝 SPEC (pendiente implementar)

**Fecha spec:** 2026-10-13
**Objetivo:** definir los 4 roles de la plataforma antes de picar RBAC.

| Rol (Auth0 Name) | Slug | Descripción |
|---|---|---|
| Coordinador de Proyecto | `coordinator` | Docente/coordinador: gestiona proyectos, eventos y revisa métricas de impacto. |
| Estudiante Voluntario | `volunteer` | Alumno monitor: escanea QR y opera en terreno (modo offline). |
| Beneficiario Comunitario | `attendee` | Asistente/vecino: participa en actividades y responde encuestas. |
| Administrador del Sistema | `admin` | Admin general: auditoría y gestión de respaldos. |

**Reglas de acceso (propuesta, a validar):**
- `admin`: todo (incluye auditoría + respaldos).
- `coordinator`: CRUD proyectos/eventos + ver métricas. No toca auditoría/respaldos.
- `volunteer`: escanear QR + registro en terreno. Sin gestión ni métricas.
- `attendee`: ver actividades + responder encuestas. Solo lectura propia.

**Cómo se implementará (notas técnicas):**
1. Crear los 4 roles en Auth0 Dashboard -> User Management -> Roles (usar los slugs).
2. El `user` del SDK no trae roles por defecto: agregar Post-Login Action que inyecte custom claim (ej. `https://sync-pass/roles` = `event.authorization.roles`).
3. En React: leer el claim del ID token y crear guardas por rol (rutas/componentes). Ojo: el frontend solo oculta UI, la autorización real debe validarla el backend/API por token.
4. Asignación inicial manual en Dashboard; después auto-asignar `attendee` por defecto al registrarse.

**Checklist para darlo por HECHO:**
1. ✅ Roles creados en Auth0 con esos slugs (2026-10-13, User Management -> Roles) + usuario de prueba creado por UI con rol `admin` asignado.
2. ⏳ Action post-login (código entregado, confirmar que quedó en el flujo Login del Dashboard).
3. 🔨 Guardas en React codeadas (2026-10-13, pendiente probar en prod, reubicadas en Paso 6):
   - `src/config/auth.ts`: `ROLES_CLAIM` + slugs `ROLES`.
   - `src/hooks/useRoles.ts`: `useUserRoles()` lee `user['https://sync-pass/roles']`, `useHasRole()`.
   - `src/components/RequireAuth.tsx`: exige login y opcionalmente rol.
   - Verificación local: `npm run build` ✅ + `npm run lint` ✅.

---

### Paso 6: Tailwind v4 + rutas (wouter) + estructura de carpetas ✅ HECHO

**Fecha:** 2026-10-13
**Objetivo:** UI base con Tailwind última versión, 3 rutas y carpetas `pages/components/hooks/config/clients`.

**1. Instalación:**
```bash
npm install tailwindcss @tailwindcss/vite wouter
# tailwindcss ^4.3.3, @tailwindcss/vite ^4.3.3, wouter ^3.13.0
```

**2. Config Tailwind v4 (sin `tailwind.config.js`, así es v4):**
- `vite.config.ts`: plugin `tailwindcss()` junto a `react()`.
- `src/index.css`: primera línea `@import 'tailwindcss';` (el resto del CSS global se mantiene).

**3. Estructura nueva (moves + archivos):**
```
src/
  pages/       HomePage, DashboardPage, UsersPage (+ *.module.css)
  components/  Layout, RequireAuth (+ *.module.css)
  hooks/       useRoles.ts (movido de src/)
  config/      auth.ts (movido de src/config.ts)
  clients/     api.ts (wrapper fetch + TODO backend)
```
- Eliminado `src/App.css` (sin uso).

**4. Rutas (wouter en `src/App.tsx`):**
- `/` pública (Home: login/signup o bienvenida + link al dashboard).
- `/dashboard` exige login (`RequireAuth`), cards placeholder.
- `/users` exige rol `admin`, tabla ejemplo.
- Nav en `Layout`: muestra Dashboard solo logeado, Usuarios solo admin.

**5. Convención CSS:** módulos `*.module.css` para lo estructural + clases Tailwind (`flex gap-2`...) para utilidades. Siempre preferir CSS module.

**Verificación (exitosa local):**
```bash
npm run build
# ✓ 36 modules transformed.
# ✓ built in 127ms
npm run lint
# oxlint sin errores
```

**Deploy a prod (2026-10-13):**
- Commit `f9c82a5` pusheado a `origin/main`, Vercel redeployó solo.
- `vercel.json` con rewrites `/(.*) -> /index.html` (SPA fallback: sin esto, recargar `/dashboard` daba 404).
- Verificación: `/`, `/dashboard`, `/users` → `200` con el bundle nuevo en prod.

**UI full-width + pulido (2026-10-13, sin commitear):**
- `#root` a ancho completo (fuera límite 1126px + bordes), `Layout` nav/main 100%.
- Header sticky con blur, botones base globales, Login primario con accent, cards con hover.
- Verificación: `npm test` 9/9 ✅, `build` ✅, `lint` ✅.

**Pendiente:**
- Probar login con usuario admin en prod y recorrer las 3 rutas.

---

### Paso 7: Convención carpeta-por-componente + tests Vitest ✅ HECHO

**Fecha:** 2026-10-13
**Objetivo:** cada componente/página vive en su carpeta kebab con su `.tsx`, `.module.css`, `.test` y `.utils.ts` (+ su test).

**1. Instalación (dev):**
```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom
# vitest ^5.0.4. RTL v16 (compatible React 19, trae renderHook si se necesita).
```

**2. Config:**
- `vite.config.ts`: `defineConfig` desde `vitest/config` + bloque `test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] }`.
- `src/test/setup.ts`: importa `@testing-library/jest-dom/vitest` (matchers como `toBeInTheDocument`).
- Scripts: `npm test` (run único) y `npm run test:watch`.

**3. Estructura adoptada:**
```
src/components/user-card/
  UserCard.tsx            componente
  UserCard.module.css     estilos (si lo necesita)
  UserCard.test.tsx       test render con Testing Library
  UserCard.utils.ts       lógica pura (si la necesita)
  UserCard.utils.test.ts  test del util
```
- Misma idea para páginas: `pages/home/`, `pages/dashboard/`, `pages/users/`.
- `components/layout/` + `Layout.test.tsx`, `components/require-auth/` + `RequireAuth.test.tsx` (mockea `@auth0/auth0-react` con `vi.mock`).
- `hooks/use-roles/` para el hook de roles.
- `hooks/use-document-title/` ejemplo de hook con `renderHook`: `useDocumentTitle()` + test (cambia y restaura el título; usado en las 3 páginas).

**Verificación (exitosa local):**
```bash
npm test
# Test Files  4 passed (4)
# Tests  9 passed (9)
npm run build   # ✓ 39 modules transformed.
npm run lint    # oxlint sin errores
```

---

## Guía: cómo crear un componente (y testearlo)

Referencia viva: `src/components/user-card/`. Regla: un componente = una carpeta kebab.

### 1. Crear la carpeta y archivos

```bash
mkdir -p src/components/mi-componente
# dentro:
#   MiComponente.tsx
#   MiComponente.module.css   (solo si necesita estilos propios)
#   MiComponente.test.tsx
```

### 2. El componente (`MiComponente.tsx`)

```tsx
import styles from './MiComponente.module.css'

export default function MiComponente({ nombre }: { nombre: string }) {
  return <p className={styles.saludo}>Hola, {nombre}</p>
}
```
- Props tipadas inline (o `type Props = {...}` si son muchas).
- Estilos estructurales en el `.module.css`, utilidades Tailwind en `className`.
- Los imports de `.module.css` funcionan en tests sin configurar nada (jsdom + vite los resuelve).

### 3. El test (`MiComponente.test.tsx`)

```tsx
import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MiComponente from './MiComponente.tsx'

describe('MiComponente', () => {
  it('saluda por nombre', () => {
    render(<MiComponente nombre="Ana" />)
    expect(screen.getByText('Hola, Ana')).toBeInTheDocument()
  })
})
```

### 4. Correr y verificar

```bash
npm test -- src/components/mi-componente   # solo tu carpeta
npm test                                    # todo el proyecto
npm run build && npm run lint               # no romper nada
```

### 5. Si el componente usa Auth0 u otro contexto: mockear

```tsx
import { beforeEach, vi } from 'vitest'

const mockUseAuth0 = vi.fn()
vi.mock('@auth0/auth0-react', () => ({ useAuth0: () => mockUseAuth0() }))

beforeEach(() => vi.clearAllMocks())

// en cada test:
mockUseAuth0.mockReturnValue({
  isLoading: false,
  isAuthenticated: true,
  loginWithRedirect: vi.fn(),
  user: { email: 'a@test.cl', 'https://sync-pass/roles': ['admin'] },
})
```
- Ejemplo real: `src/components/require-auth/RequireAuth.test.tsx`.
- `vi.mock` va arriba del archivo (se eleva solo); el `mockReturnValue` se setea por test.
- Para hooks sueltos, RTL trae `renderHook` (ej. `renderHook(() => useUserRoles(), { wrapper })`).

## Guía: cómo crear un utils (y testearlo)

Si la lógica es pura (sin JSX ni hooks), va a `MiComponente.utils.ts` al lado del componente.

### 1. El archivo (`MiComponente.utils.ts`)

```ts
export function roleLabel(slug: string): string {
  const labels: Record<string, string> = { admin: 'Administrador del Sistema' }
  return labels[slug] ?? slug
}
```

### 2. Su test (`MiComponente.utils.test.ts`, ojo: `.test.ts`, no `.tsx`)

```ts
import { describe, expect, it } from 'vitest'
import { roleLabel } from './MiComponente.utils.ts'

describe('roleLabel', () => {
  it('traduce slugs conocidos', () => {
    expect(roleLabel('admin')).toBe('Administrador del Sistema')
  })

  it('devuelve el slug si no lo conoce', () => {
    expect(roleLabel('otro')).toBe('otro')
  })
})
```

### 3. Correr

```bash
npm test -- src/components/mi-componente
```

**Criterio:** ¿lleva JSX o hooks? → `.tsx` + Testing Library. ¿Función pura? → `.utils.ts` + asserts directos (más rápido y simple).

## Convención de documentación

1. Trabajamos el paso en código.
2. Verificamos con comando (`build`, `dev`, URL Vercel, etc.).
3. Recién ahí lo escribimos aquí como ✅ HECHO con fecha + verificación.
4. Lo pendiente queda como ⏳ PENDIENTE con checklist.