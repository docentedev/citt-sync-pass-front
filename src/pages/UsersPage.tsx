import styles from './UsersPage.module.css'

// Placeholder: la lista real vendrá del backend (Management API nunca se
// llama desde el frontend porque expondría el token de gestión).
const ROWS = [
  { email: 'admin@sync-pass.test', role: 'admin' },
  { email: 'coordinador@sync-pass.test', role: 'coordinator' },
  { email: 'voluntario@sync-pass.test', role: 'volunteer' },
]

export default function UsersPage() {
  return (
    <section>
      <h1>Usuarios</h1>
      <p className="mb-4">Solo administradores. Datos de ejemplo.</p>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Rol</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.email}>
              <td>{r.email}</td>
              <td>{r.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
