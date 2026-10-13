// Config centralizada del front: un solo archivo.
// Cada valor sale de `VITE_*` (/.env.local en local) con default en duro,
// porque el plan actual de Vercel no permite setear envs en prod.
// (domain + clientId son públicos de SPA, no secretos).
const env = import.meta.env

export const AUTH0_DOMAIN: string =
  env.VITE_AUTH0_DOMAIN ?? 'dev-qd6i88udlr5yzjtv.us.auth0.com'
export const AUTH0_CLIENT_ID: string =
  env.VITE_AUTH0_CLIENT_ID ?? 'zpg5yYHLp9KiFYj0tNaZO8eaSfMGrgcZ'

// Custom claim donde la Post-Login Action inyecta los roles (ver README Paso 5).
// Debe ser idéntico al usado en la Action de Auth0.
export const ROLES_CLAIM: string =
  env.VITE_AUTH0_ROLES_CLAIM ?? 'https://sync-pass/roles'

// API registrada en Auth0 (Applications -> APIs). Es el `audience` del access token
// que valida el BFF. Debe ser idéntico al Identifier del Dashboard.
export const AUTH0_AUDIENCE: string =
  env.VITE_AUTH0_AUDIENCE ?? 'https://sync-pass-api'

// URL del BFF. Default local; en local se sobreescribe con .env.local
// apuntando al servicio de CasaOS.
export const BFF_URL: string =
  env.VITE_BFF_URL ?? 'http://localhost:8080'

export interface BffUser {
  id: string
  email: string
  role: string
}

// Slugs de roles (ver README Paso 5).
export const ROLES = {
  admin: 'admin',
  coordinator: 'coordinator',
  volunteer: 'volunteer',
  attendee: 'attendee',
} as const
