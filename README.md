# Sync Pass

Plataforma de gestión de proyectos, eventos y asistencia en terreno. Frontend React + BFF Spring Boot, auth con Auth0 y roles.

> Esta es la bitácora oficial paso a paso. Solo se marca un paso ✅ cuando queda verificado.

## Stack actual (verificado 2026-10-13)

**Frontend** (`/`):
- Node v24.15.0 / npm 11.12.1
- React ^19.2.8 + react-dom ^19.2.8, TypeScript ~6.0.2, Vite ^8.3.0
- Tailwind CSS ^4.3.3 (plugin `@tailwindcss/vite`), wouter ^3.13.0
- Auth0 `@auth0/auth0-react` ^2.28.2
- Tests: vitest ^5.0.4 + jsdom + Testing Library (react ^16.3.3, jest-dom ^7.0.1)
- Lint: oxlint

**BFF** (`bff/`):
- Java 21.0.12 + Gradle wrapper 8.14.3 + Spring Boot 3.5.16
- `spring-boot-starter-web`, `spring-boot-starter-security`, `spring-boot-starter-oauth2-resource-server`

**Prod:** https://citt-sync-pass-front.vercel.app/ (deploy automático por push a `main`)

## Cómo correr en local

```bash
# Frontend
npm install
npm run dev        # http://localhost:5173 (HMR)
npm test           # vitest run único
npm run test:watch # modo watch
npm run build      # tsc -b && vite build -> dist/
npm run lint       # oxlint

# BFF (Java 21)
cd bff
export JAVA_HOME=/opt/homebrew/opt/openjdk@21
./gradlew bootRun  # http://localhost:8080
./gradlew build    # compila + tests
```

## Bitácora paso a paso

### Paso 1: Proyecto base React + Vite + TS ✅ HECHO

**Fecha:** 2026-10-13
**Objetivo:** partir del template Vite React-TS y dejarlo corriendo + compilando.

**Qué se hizo:**
1. Se inspeccionó la estructura (`index.html`, `src/`, `package.json`, `vite.config.ts`).
2. Se personalizó el `README.md` a `Sync Pass` y se agregó `.private/` al `.gitignore`.

**Verificación:** `npm run build` limpio (20 módulos, `dist/` generado).

**Errores comunes:**
- `tsc -b` falla → revisar `tsconfig.app.json` / tipos en `src/`.
- Puerto 5173 ocupado → Vite propone otro automáticamente o usar `vite --port 5174`.

---

### Paso 2: Deploy en Vercel ✅ HECHO

**Fecha:** 2026-10-13
**Objetivo:** publicar `main` en Vercel con deploy automático por push.

**Configuración (presets Vite):** Framework `Vite`, Build `npm run build`, Output `dist`, Install `npm install`.

**Datos:**
- URL prod: https://citt-sync-pass-front.vercel.app/
- Nota: la primera URL entregada (`...8o9a1uwwc...vercel.app`) tenía Deployment Protection (redirect a `vercel.com/login`); se descartó y se validó la de producción (`curl` → `200` con el bundle del build).

---

### Paso 3: Auth con Auth0 ✅ HECHO

**Fecha:** 2026-10-13
**Objetivo:** login/signup/logout + perfil con el React Quickstart de Auth0.

**Config en Auth0 Dashboard:**
- Domain: `dev-qd6i88udlr5yzjtv.us.auth0.com`
- Allowed Callback / Logout / Web Origins: `https://citt-sync-pass-front.vercel.app` y `http://localhost:5173` (con y sin `/` final, Auth0 compara exacto).
- Conexión: solo email + password (social desactivada en la app, ver error Dev Keys).

**Qué se hizo:**
1. `npm install @auth0/auth0-react@2.x` (quedó `^2.28.2`).
2. `src/main.tsx`: `<App />` envuelto en `<Auth0Provider domain clientId authorizationParams={{ redirect_uri: window.location.origin }}>`.
3. Flujo `useAuth0()` (login/signup/logout/perfil). Ajustes TS: `user?.email` y `onClick={() => login()}` (evita error TS2322).

**Verificación:** `npm run build` ✅ + login probado en prod con usuario de prueba.

**Errores típicos:**
- `Callback URL mismatch`: registrar las URLs con y sin slash, en prod y local.
- Aviso `Dev Keys`: la conexión social usaba credenciales de prueba → se desactivó (Applications → app → Connections). Para Google real a futuro: OAuth Client ID propio en Google Cloud Console → Authentication → Social → Google.

---

### Paso 4: Auth0 centralizado en config ✅ HECHO

**Fecha:** 2026-10-13
**Objetivo:** sacar `domain`/`clientId` de `src/main.tsx` a un archivo de config (se optó por valores en duro para no depender de envs en Vercel).

**Qué se hizo:** `src/config/auth.ts` (hoy) con `AUTH0_DOMAIN` y `AUTH0_CLIENT_ID`; `main.tsx` importa de ahí. Se descartó el intento intermedio con `.env` (archivos eliminados).

**Nota:** `domain` + `clientId` son valores públicos de SPA (visibles en el JS), no secretos. Nunca poner un `clientSecret` en el frontend.

**Regla de orden (2026-10-13, rev. 2026-10-14):** toda la config del front vive en `src/config/auth.ts` (único archivo: Auth0, audience, BFF_URL, claim, roles). Cada valor sale de `VITE_*` con default en duro: en local se sobreescribe con `.env.local` (ignorado por git, ej. `VITE_BFF_URL` al servicio de CasaOS); en Vercel no hay `.env.local`, así que prod usa los defaults. Nada hardcodeado fuera de ahí (ni en páginas ni en tests). En el BFF, lo mismo: todo en `application.yml` + package `config/` (`Auth0Properties`, `CorsProperties`).

---

### Paso 5: Roles y permisos ✅ HECHO

**Fecha:** 2026-10-13
**Objetivo:** RBAC con 4 roles: `admin`, `coordinator`, `volunteer`, `attendee`.

| Rol (Auth0 Name) | Slug | Acceso |
|---|---|---|
| Administrador del Sistema | `admin` | Todo: auditoría y respaldos |
| Coordinador de Proyecto | `coordinator` | CRUD proyectos/eventos + métricas |
| Estudiante Voluntario | `volunteer` | Escaneo QR + registro en terreno |
| Beneficiario Comunitario | `attendee` | Ver actividades + responder encuestas |

**Cómo funciona:**
1. Roles creados en Auth0 (User Management → Roles) + usuario de prueba con rol `admin`.
2. Post-Login Action `add-roles-claim` (en el flujo Login) inyecta `https://sync-pass/roles` en ID token **y** access token.
3. React lee el claim (`useUserRoles()` / `useHasRole()`) y `RequireAuth` protege rutas. Ojo: el frontend solo oculta UI; la autorización real la valida el BFF por token.

---

### Paso 6: Tailwind v4 + rutas + estructura ✅ HECHO

**Fecha:** 2026-10-13
**Objetivo:** UI base con Tailwind, 3 rutas y carpetas por dominio.

**Qué se hizo:**
1. `npm install tailwindcss @tailwindcss/vite wouter` (en v4 no hay `tailwind.config.js`).
2. `vite.config.ts`: plugin `tailwindcss()`; `src/index.css`: `@import 'tailwindcss';` en primera línea.
3. Estructura `src/`: `pages/`, `components/`, `hooks/`, `config/`, `clients/` (luego a carpetas por componente en Paso 7; `src/App.css` eliminado).
4. Rutas wouter en `App.tsx`: `/` pública, `/dashboard` con login, `/users` solo `admin`. Nav que muestra links según sesión/rol.
5. `vercel.json` con rewrites `/(.*) → /index.html` (sin esto, recargar `/dashboard` daba 404).
6. UI full-width + pulido: `#root` 100%, header sticky con blur, botones base, cards con hover.
7. Convención CSS: módulos `*.module.css` para lo estructural + Tailwind para utilidades.

**Verificación:** `npm run build` ✅ + `npm run lint` ✅ + deploys a prod verificados (`/`, `/dashboard`, `/users` → `200`; commits `f9c82a5`, `9133d9d`).

---

### Paso 7: Convención carpeta-por-componente + tests ✅ HECHO

**Fecha:** 2026-10-13
**Objetivo:** cada componente/página en su carpeta kebab con `.tsx`, `.module.css`, `.test` y `.utils.ts` (+ su test).

**Qué se hizo:**
1. `npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom` (RTL v16, con `renderHook`).
2. `vite.config.ts`: `defineConfig` desde `vitest/config` + `test: { environment: 'jsdom', setupFiles: ['./src/test/setup.ts'] }`. Scripts `npm test` / `test:watch`.
3. Ejemplo de referencia `components/user-card/` (`UserCard` + `roleLabel` + tests, usado en `/users`).
4. Tests con Auth0 mockeado (`vi.mock`): `RequireAuth` (4 casos), `Layout`, `UsersPage` (incluye fallback a login interactivo).
5. `hooks/use-document-title/`: `useDocumentTitle()` testeado con `renderHook`, usado en las 3 páginas.

**Verificación:** `npm test` → 6 archivos, 14 tests ✅ + `build` ✅ + `lint` ✅.

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
- Los imports de `.module.css` funcionan en tests sin configurar nada.

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

### 5. Si usa Auth0 u otro contexto: mockear

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
- Para hooks sueltos: `renderHook` de RTL.

## Guía: cómo crear un utils (y testearlo)

Si la lógica es pura (sin JSX ni hooks), va a `MiComponente.utils.ts` al lado del componente, con su `MiComponente.utils.test.ts` (ojo: `.test.ts`, no `.tsx`) y asserts directos.

**Criterio:** ¿lleva JSX o hooks? → `.tsx` + Testing Library. ¿Función pura? → `.utils.ts` (más rápido y simple).

---

### Paso 8: BFF Spring Boot + Auth0 ✅ HECHO

**Fecha:** 2026-10-13
**Objetivo:** `bff/` valida el JWT de Auth0 y expone `GET /api/users` (mock) solo a `admin`.

**Stack:** Spring Boot `3.5.16` + Gradle wrapper `8.14.3` + Java `21.0.12` (vía brew).
**Archivos:** `BffApplication`, `config/` (`Auth0Properties`, `CorsProperties`, `SecurityConfig`), `security/` (`AudienceValidator`, `RolesClaimConverter`), `web/` (`UserController` + `UserDto`), tests (`BffApplicationTests`, `UserControllerTest`, `RolesClaimConverterTest`).
**Cómo valida:** JWKS del tenant + issuer + audience `https://sync-pass-api` + claim `https://sync-pass/roles` → authorities `ROLE_*` → `@PreAuthorize("hasRole('admin')")`.

**Config Auth0 necesaria (hecha en Dashboard):**
1. API `Sync Pass API`, Identifier `https://sync-pass-api`, RS256.
2. Action `add-roles-claim` con claim en ID token **y** access token, en el flujo Login.
3. App SPA autorizada en el API + `Allow Skipping User Consent` ON.

**Verificación:** `./gradlew build` ✅ (`401` sin token, `403` sin admin, `200` + mock con admin) + app levantada: `curl /api/users` → `401`, preflight CORS desde Vercel → `200`.

---

### Paso 9: Frontend conectado al BFF ✅ HECHO

**Fecha:** 2026-10-13
**Objetivo:** `/users` muestra usuarios reales del BFF en vez del mock estático.

**Qué se hizo:**
1. `src/config/auth.ts`: `AUTH0_AUDIENCE = 'https://sync-pass-api'`, `BFF_URL = 'http://localhost:8080'` (sin BFF en prod aún) + tipo `BffUser`.
2. `src/clients/api.ts`: `apiGetUsers(token)` → `GET /api/users`.
3. `src/pages/users/UsersPage.tsx`: pide `getAccessTokenSilently({ authorizationParams: { audience } })`. Estados: cargando / lista (`UserCard`) / error con pista. Si el silent falla con `consent_required`, hace `loginWithRedirect` con el audience una vez (patrón oficial Auth0).
4. `UsersPage.test.tsx`: audience correcto, render de lista, error de red y redirección por consentimiento.

**Verificación end-to-end (local, con BFF levantado):** login como admin → `/users` lista los 3 usuarios del BFF ✅.

**Errores típicos (resueltos):**
- `Client ... is not authorized to access resource server`: autorizar la SPA en el API (pestaña Machine to Machine Applications / Application Access).
- `Consent required`: `Allow Skipping User Consent` ON + fallback a login interactivo en código.

---

### Paso 10: BFF en CasaOS + front en Vercel ✅ HECHO

**Fecha:** 2026-10-13
**Objetivo:** BFF sin DB/WS corriendo en CasaOS (`192.168.1.46:3004`) y consumido por el front en Vercel por HTTPS.

**Qué se hizo:**
1. Jar ya compilado (`bff/build/libs/sync-pass-bff-0.0.1.jar`) copiado a `/DATA/AppData/sync-pass-bff/app.jar` en el mini PC; contenedor `sync-pass-bff` con `eclipse-temurin:21-jre` (sin build en el servidor), puerto `0.0.0.0:3004->8080`, mismas env Auth0 del `docker-compose.yml`.
2. NPM: `bff.casa.claudioviajando.com` (cert comodín + lista `solo-lan`) y `bff.claudioviajando.com` (cert propio Porkbun DNS-01, público). dnsmasq: `bff.claudioviajando.com -> 192.168.1.46` en LAN.
3. Front: `.env.development` → BFF del repo (`:8080`); `.env.local` → BFF desplegado (`http://192.168.1.46:3004`, gana comentando la línea de `.env.development`); `.env.production` + default en código → `https://bff.claudioviajando.com` en Vercel. Reiniciar `npm run dev` tras cambiar envs.

**Verificación:** `GET /api/users` sin token → `401` en directo (`:3004`), interno (`bff.casa`) y público (`bff.claudioviajando.com`); preflight CORS `200` desde Vercel y `localhost:5173`. `npm run build` ✅ + `npm test` (14) ✅.

## Convención de documentación

1. Trabajamos el paso en código.
2. Verificamos con comando (`build`, `dev`, URL Vercel, etc.).
3. Recién ahí lo marcamos ✅ con fecha + verificación.
4. Lo pendiente queda explícito con checklist.
