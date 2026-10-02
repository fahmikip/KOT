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
 * Isi sengaja dibatasi (Phase 1 §6): nama aplikasi, versi, dan tombol menu mobile.
 * Tidak ada profil pengguna, notifikasi, login, avatar, atau pencarian global —
 * fitur-fitur itu belum ada di SOURCE_OF_TRUTH.md.
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
            <span className="header__menu-icon" aria-hidden="true">
              {isMenuOpen ? '✕' : '☰'}
            </span>
          </button>
        ) : null}

        <div className="header__identity">
          <span className="header__mark" aria-hidden="true" />
          <span className="header__name">{APP_NAME}</span>
          <span className="header__version">v{APP_SHORT_VERSION}</span>
        </div>

        <p className="header__tagline">{APP_TAGLINE}</p>
      </div>
    </header>
  )
}