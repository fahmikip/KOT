import { Icon } from '@/components/Icon'
import { APP_NAME, APP_SHORT_VERSION, APP_TAGLINE } from '@/lib/appInfo'
import './Header.css'

export interface HeaderProps {
  /** Hanya tampil dan berfungsi di layout mobile/tablet. */
  onMenuToggle: () => void
  isMenuOpen: boolean
  showMenuButton: boolean
}

/**
 * Header aplikasi.
 *
 * Isi sengaja dibatasi (ARCHITECTURE.md §4): nama aplikasi, versi, dan tombol
 * menu mobile. Tidak ada profil pengguna, notifikasi, login, avatar, atau
 * pencarian global — fitur-fitur itu belum ada di SOURCE_OF_TRUTH.md.
 *
 * Pernyataan "diproses di perangkat ini" bukan hiasan: itu prinsip local-first
 * yang dijamin arsitektur (DEC-001), dan tidak menyesatkan karena tidak ada
 * jaringan di aplikasi ini sama sekali.
 */
export function Header({ onMenuToggle, isMenuOpen, showMenuButton }: HeaderProps) {
  return (
    <header className="header">
      <div className="header__inner">
        {showMenuButton ? (
          <button
            type="button"
            className="header__menu-button"
            onClick={onMenuToggle}
            aria-expanded={isMenuOpen}
            aria-label={isMenuOpen ? 'Tutup menu navigasi' : 'Buka menu navigasi'}
          >
            <Icon name={isMenuOpen ? 'close' : 'menu'} size="sm" />
          </button>
        ) : null}

        <div className="header__identity">
          <span className="header__mark" aria-hidden="true">
            K
          </span>
          <div className="header__names">
            <span className="header__name">{APP_NAME}</span>
            <span className="header__tagline">{APP_TAGLINE}</span>
          </div>
          <span className="header__version">v{APP_SHORT_VERSION}</span>
        </div>

        <p className="header__assurance">
          <Icon name="lock" size="sm" />
          <span className="header__assurance-text">File diproses di perangkat ini</span>
        </p>
      </div>
    </header>
  )
}
