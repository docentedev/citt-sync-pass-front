import { useAuth0 } from '@auth0/auth0-react'
import { ROLES_CLAIM } from '../config/auth.ts'

/** Lee los roles del ID token (los pone la Post-Login Action, ver README Paso 5). */
export function useUserRoles(): string[] {
  const { user } = useAuth0()
  const claim = (user as Record<string, unknown> | undefined)?.[ROLES_CLAIM]
  if (!Array.isArray(claim)) return []
  return claim.filter((r): r is string => typeof r === 'string')
}

/** True si el usuario tiene al menos uno de los roles indicados. */
export function useHasRole(...slugs: string[]): boolean {
  const roles = useUserRoles()
  return slugs.some((s) => roles.includes(s))
}
