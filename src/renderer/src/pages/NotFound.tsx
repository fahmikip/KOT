import { Link, useLocation } from 'react-router-dom'
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
      <Link className="not-found__back" to="/">
        Kembali ke Dashboard
      </Link>
    </div>
  )
}