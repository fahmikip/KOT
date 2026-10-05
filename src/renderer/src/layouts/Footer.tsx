import { Icon } from '@/components/Icon'
import { APP_DISCLAIMER, APP_VERSION } from '@/lib/appInfo'
import './Footer.css'

/**
 * Footer. Satu-satunya purpose: menampilkan disclaimer (DEC-003) dan versi penuh.
 * Tidak ada link eksternal, tidak ada copyright, tidak ada social link.
 */
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <p className="footer__disclaimer">
          <Icon name="info" size="sm" />
          <span>{APP_DISCLAIMER}</span>
        </p>
        <p className="footer__version">Versi {APP_VERSION}</p>
      </div>
    </footer>
  )
}
