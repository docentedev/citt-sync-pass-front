import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'wouter'
import { useUserRoles } from '../hooks/useRoles.ts'
import styles from './HomePage.module.css'

export default function HomePage() {
  const { isAuthenticated, loginWithRedirect: login } = useAuth0()
  const roles = useUserRoles()

  const signup = () =>
    login({ authorizationParams: { screen_hint: 'signup' } })

  return (
    <section className={styles.hero}>
      <h1>Sync Pass</h1>
      <p>Gestión de proyectos, eventos y asistencia en terreno.</p>
      {isAuthenticated ? (
        <div className="flex gap-2 justify-center mt-4">
          <Link href="/dashboard">Ir al dashboard</Link>
          {roles.length > 0 && <span>Rol: {roles.join(', ')}</span>}
        </div>
      ) : (
        <div className={styles.actions}>
          <button onClick={signup}>Signup</button>
          <button onClick={() => login()}>Login</button>
        </div>
      )}
    </section>
  )
}
