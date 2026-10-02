import { APP_DISCLAIMER, APP_VERSION } from '@/lib/appInfo'
import './Footer.css'

/**
 * Footer. Satu-satunya purpose: menampilkan disclaimer (DEC-003) dan versi penuh.
 * Tidak ada link eksternal, tidak ada copyright, tidak ada social link.
 */
export function Footer() {
  return (
    <footer className="footer">
      <p className="footer__disclaimer">{APP_DISCLAIMER}</p>
      <p className="footer__version">Versi {APP_VERSION}</p>
    </footer>
  )
}