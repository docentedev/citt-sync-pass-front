import type { ReactNode } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { Link } from 'wouter'
import { ROLES } from '../config/auth.ts'
import { useHasRole } from '../hooks/useRoles.ts'
import styles from './Layout.module.css'

export default function Layout({ children }: { children: ReactNode }) {
  const { isAuthenticated, logout: auth0Logout, user } = useAuth0()
  const isAdmin = useHasRole(ROLES.admin)
  const logout = () =>
    auth0Logout({ logoutParams: { returnTo: window.location.origin } })

  return (
    <>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.brand}>
            Sync Pass
          </Link>
          <Link href="/" className={styles.link}>
            Inicio
          </Link>
          {isAuthenticated && (
            <Link href="/dashboard" className={styles.link}>
              Dashboard
            </Link>
          )}
          {isAdmin && (
            <Link href="/users" className={styles.link}>
              Usuarios
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <span className={styles.user}>{user?.email}</span>
              <button onClick={logout}>Salir</button>
            </>
          ) : (
            <Link href="/" className={styles.link}>
              Ingresar
            </Link>
          )}
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </>
  )
}
