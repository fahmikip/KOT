import { Link, useLocation } from 'react-router-dom'
import { Icon } from '@/components/Icon'
import { DASHBOARD_ROUTE } from '@/lib/routes'
import './NotFound.css'

/**
 * 404. Route di dalam AppLayout, jadi header/sidebar tetap tampil.
 * Menampilkan path yang diminta untuk memudahkan user melaporkan bug.
 */
export function NotFound() {
  const { pathname } = useLocation()

  return (
    <div className="not-found">
      <p className="not-found__code">404</p>
      <h1 className="not-found__title">Halaman tidak ditemukan</h1>
      <p className="not-found__path">
        Alamat yang diminta: <code className="not-found__code-inline">{pathname}</code>
      </p>
      <Link className="link-button not-found__back" to={DASHBOARD_ROUTE}>
        <Icon name="arrow-left" size="sm" />
        <span>Kembali ke Dashboard</span>
      </Link>
    </div>
  )
}
