import type { ReactNode } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { useUserRoles } from '../../hooks/use-roles/useRoles.ts'

/** Envuelve rutas que exigen login y, opcionalmente, alguno de los roles. */
export default function RequireAuth({
  roles,
  children,
}: {
  roles?: string[]
  children: ReactNode
}) {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0()
  const userRoles = useUserRoles()

  if (isLoading) return <p>Cargando...</p>

  if (!isAuthenticated) {
    return (
      <div>
        <p>Debes iniciar sesión para ver esta página.</p>
        <button onClick={() => loginWithRedirect()}>Login</button>
      </div>
    )
  }

  if (roles && !roles.some((r) => userRoles.includes(r))) {
    return <p>Acceso denegado: se requiere rol {roles.join(' o ')}.</p>
  }

  return <>{children}</>
}
