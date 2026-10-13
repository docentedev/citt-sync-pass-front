// Cliente HTTP base para el futuro backend (aún no existe: placeholders en las pages).
// Cuando haya API, el token se obtiene con getAccessTokenSilently() de Auth0.

const API_BASE = '' // ej. 'https://api.tudominio.com' cuando exista

export async function apiGet<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return res.json() as Promise<T>
}
