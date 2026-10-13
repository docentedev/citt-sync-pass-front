import { useUserRoles } from '../hooks/useRoles.ts'
import styles from './DashboardPage.module.css'

// Datos de ejemplo: cuando haya backend salen de src/clients/api.ts
const CARDS = [
  { title: 'Proyectos activos', value: 3, hint: 'coordinator' },
  { title: 'Eventos próximos', value: 5, hint: 'coordinator' },
  { title: 'Asistencias (QR)', value: 128, hint: 'volunteer' },
  { title: 'Encuestas pendientes', value: 2, hint: 'attendee' },
]

export default function DashboardPage() {
  const roles = useUserRoles()

  return (
    <section>
      <h1>Dashboard</h1>
      <p className="mb-4">Vista simple. Rol actual: {roles.join(', ') || '—'}</p>
      <div className={styles.grid}>
        {CARDS.map((c) => (
          <article key={c.title} className={styles.card}>
            <p className={styles.number}>{c.value}</p>
            <h2>{c.title}</h2>
            <small>Placeholder (rol sugerido: {c.hint})</small>
          </article>
        ))}
      </div>
    </section>
  )
}
