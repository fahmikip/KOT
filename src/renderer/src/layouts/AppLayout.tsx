import { useCallback, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Footer } from '@/layouts/Footer'
import { Header } from '@/layouts/Header'
import { Sidebar } from '@/layouts/Sidebar'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/cn'
import './AppLayout.css'

interface MenuState {
  pathname: string
  isOpen: boolean
}

/**
 * Shell aplikasi: header + sidebar + konten + footer.
 *
 * Responsive (Phase 1 §15):
 * - Desktop (>=1024px): sidebar menjadi kolom permanen.
 * - Tablet dan mobile (<1024px): sidebar menjadi drawer, dibuka dari tombol menu header.
 */
export function AppLayout() {
  const isDesktop = useIsDesktop()
  const location = useLocation()
  const [menuState, setMenuState] = useState<MenuState>({
    pathname: location.pathname,
    isOpen: false
  })

  // Menyesuaikan state saat render, bukan di dalam effect: drawer harus menutup
  // setiap pindah halaman dan otomatis tidak berlaku di desktop.
  if (menuState.pathname !== location.pathname || (isDesktop && menuState.isOpen)) {
    setMenuState({ pathname: location.pathname, isOpen: false })
  }

  const isMenuOpen = !isDesktop && menuState.isOpen

  const closeMenu = useCallback(() => {
    setMenuState((previous) => ({ ...previous, isOpen: false }))
  }, [])

  const toggleMenu = useCallback(() => {
    setMenuState((previous) => ({ ...previous, isOpen: !previous.isOpen }))
  }, [])

  // Escape menutup drawer. Effect ini hanya memasang listener DOM.
  useEffect(() => {
    if (!isMenuOpen) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeMenu()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeMenu, isMenuOpen])

  return (
    <div className={cn('app-layout', isDesktop && 'app-layout--desktop')}>
      <Header
        onMenuToggle={toggleMenu}
        isMenuOpen={isMenuOpen}
        showMenuButton={!isDesktop}
      />

      <div className="app-layout__body">
        {/*
          Di desktop sidebar dirender sebagai kolom statis. Di mobile/tablet ia
          dirender sebagai drawer dengan status terbuka/tertutup.
        */}
        <div
          className={cn('app-layout__sidebar', isMenuOpen && 'app-layout__sidebar--open')}
          data-open={isMenuOpen ? 'true' : 'false'}
        >
          <Sidebar isOpen={isMenuOpen} onNavigate={closeMenu} />
        </div>

        {!isDesktop && isMenuOpen ? (
          <button
            type="button"
            className="app-layout__scrim"
            onClick={closeMenu}
            aria-label="Tutup menu navigasi dengan klik di luar"
          />
        ) : null}

        <main className="app-layout__main" id="main-content">
          <Outlet />
        </main>
      </div>

      <Footer />
    </div>
  )
}