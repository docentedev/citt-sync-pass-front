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

**Pendiente para ✅ total:**
- Push -> Vercel redeploy -> probar Signup/Login/Logout en `https://citt-sync-pass-front.vercel.app/` y confirmar `redirect_uri` + logout `returnTo` vuelven al origen.

## Convención de documentación

1. Trabajamos el paso en código.
2. Verificamos con comando (`build`, `dev`, URL Vercel, etc.).
3. Recién ahí lo escribimos aquí como ✅ HECHO con fecha + verificación.
4. Lo pendiente queda como ⏳ PENDIENTE con checklist.