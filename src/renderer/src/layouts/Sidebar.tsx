import { NavLink } from 'react-router-dom'
import { Badge } from '@/components/Badge'
import { cn } from '@/lib/cn'
import { DASHBOARD_ROUTE, TOOL_GROUPS, TOOL_STATUS, toolsByGroup, type ToolStatus } from '@/lib/routes'
import './Sidebar.css'

export interface SidebarProps {
  /** true = drawer terbuka (mobile/tablet). Tidak dipakai di layout desktop. */
  isOpen: boolean
  onNavigate: () => void
}

const STATUS_BADGE: Record<ToolStatus, { label: string; tone: 'info' }> = {
  [TOOL_STATUS.COMING_SOON]: { label: 'Coming Soon', tone: 'info' },
  [TOOL_STATUS.READY]: { label: 'Siap digunakan', tone: 'info' }
}

/**
 * Navigasi utama.
 *
 * Menu item SELALU memakai <NavLink> (link), bukan button — navigasi harus berupa
 * link agar bisa dibuka di tab baru dan dibaca screen reader dengan benar.
 * Tool yang belum aktif diberi label COMING SOON yang eksplisit; tidak ada
 * halaman palsu yang seolah-olah fiturnya sudah berfungsi.
 */
export function Sidebar({ isOpen, onNavigate }: SidebarProps) {
  return (
    <nav
      className={cn('sidebar', isOpen && 'sidebar--open')}
      id="sidebar-navigation"
      aria-label="Navigasi utama"
    >
      <NavLink
        to={DASHBOARD_ROUTE}
        end
        className={({ isActive }) => cn('sidebar__link', isActive && 'sidebar__link--active')}
        onClick={onNavigate}
      >
        Dashboard
      </NavLink>

      {TOOL_GROUPS.map((group) => (
        <div key={group.id} className="sidebar__group">
          <p className="sidebar__group-label">{group.label}</p>
          <ul className="sidebar__list">
            {toolsByGroup(group.id).map((tool) => {
              const badge = STATUS_BADGE[tool.status]
              return (
                <li key={tool.id}>
                  <NavLink
                    to={tool.path}
                    className={({ isActive }) =>
                      cn('sidebar__link', isActive && 'sidebar__link--active')
                    }
                    onClick={onNavigate}
                  >
                    <span className="sidebar__link-label">{tool.label}</span>
                    <Badge tone={badge.tone}>{badge.label}</Badge>
                  </NavLink>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}
