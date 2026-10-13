import UserCard from '../../components/user-card/UserCard.tsx'
import { useDocumentTitle } from '../../hooks/use-document-title/useDocumentTitle.ts'
import styles from './UsersPage.module.css'

// Placeholder: la lista real vendrá del backend (Management API nunca se
// llama desde el frontend porque expondría el token de gestión).
const ROWS = [
  { email: 'admin@sync-pass.test', role: 'admin' },
  { email: 'coordinador@sync-pass.test', role: 'coordinator' },
  { email: 'voluntario@sync-pass.test', role: 'volunteer' },
]

export default function UsersPage() {
  useDocumentTitle('Usuarios | Sync Pass')
  return (
    <section>
      <h1>Usuarios</h1>
      <p className="mb-4">Solo administradores. Datos de ejemplo.</p>
      <div className={styles.list}>
        {ROWS.map((r) => (
          <UserCard key={r.email} email={r.email} role={r.role} />
        ))}
      </div>
    </section>
  )
}
