// Config centralizada (valores públicos de SPA: domain + clientId no son secretos).
// Se dejan en duro porque el plan actual de Vercel no permite setear envs.
export const AUTH0_DOMAIN = 'dev-qd6i88udlr5yzjtv.us.auth0.com'
export const AUTH0_CLIENT_ID = 'zpg5yYHLp9KiFYj0tNaZO8eaSfMGrgcZ'

// Custom claim donde la Post-Login Action inyecta los roles (ver README Paso 5).
// Debe ser idéntico al usado en la Action de Auth0.
export const ROLES_CLAIM = 'https://sync-pass/roles'

// Slugs de roles (ver README Paso 5).
export const ROLES = {
  admin: 'admin',
  coordinator: 'coordinator',
  volunteer: 'volunteer',
  attendee: 'attendee',
} as const
