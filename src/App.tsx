import { Route, Switch } from 'wouter'
import Layout from './components/Layout.tsx'
import RequireAuth from './components/RequireAuth.tsx'
import { ROLES } from './config/auth.ts'
import DashboardPage from './pages/DashboardPage.tsx'
import HomePage from './pages/HomePage.tsx'
import UsersPage from './pages/UsersPage.tsx'

export default function App() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/dashboard">
          <RequireAuth>
            <DashboardPage />
          </RequireAuth>
        </Route>
        <Route path="/users">
          <RequireAuth roles={[ROLES.admin]}>
            <UsersPage />
          </RequireAuth>
        </Route>
        <Route>404: página no encontrada.</Route>
      </Switch>
    </Layout>
  )
}
