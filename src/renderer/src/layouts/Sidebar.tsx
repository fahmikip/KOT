import { NavLink } from 'react-router-dom'
import { Icon } from '@/components/Icon'
import { DASHBOARD_ROUTE, TOOL_GROUPS, TOOL_STATUS, toolsByGroup, type ToolStatus } from '@/lib/routes'
import { TOOL_GROUP_ICON } from '@/lib/toolIcons'
import { cn } from '@/lib/cn'
import './Sidebar.css'

export interface SidebarProps {
  /** true = drawer terbuka (mobile/tablet). Tidak dipakai di layout desktop. */
  isOpen: boolean
  onNavigate: () => void
}

const STATUS: Record<ToolStatus, { label: string; state: 'ready' | 'planned' }> = {
  [TOOL_STATUS.COMING_SOON]: { label: 'Coming Soon', state: 'planned' },
  [TOOL_STATUS.READY]: { label: 'Siap digunakan', state: 'ready' }
}

/**
 * Navigasi utama.
 *
 * Menu item SELALU memakai <NavLink> (link), bukan button — navigasi harus berupa
 * link agar bisa dibuka di tab baru dan dibaca screen reader dengan benar.
 * Status tool tidak pernah disembunyikan: titik di kanan selalu berpasangan dengan
 * teks screen reader, jadi yang melihat dan yang membaca dapat info yang sama.
 * Tidak ada tombol collapse, tidak ada sub-menu, tidak ada filter.
 */
export function Sidebar({ isOpen, onNavigate }: SidebarProps) {
  return (
    <nav
      className={cn('sidebar', isOpen && 'sidebar--open')}
      id="sidebar-navigation"
      aria-label="Navigasi utama"
    >
      <ul className="sidebar__list">
        <li>
          <NavLink
            to={DASHBOARD_ROUTE}
            end
            className={({ isActive }) => cn('sidebar__link', isActive && 'sidebar__link--active')}
            onClick={onNavigate}
          >
            <span className="sidebar__link-main">
              <Icon name="grid" size="sm" />
              <span className="sidebar__link-label">Dashboard</span>
            </span>
          </NavLink>
        </li>
      </ul>

      <div className="sidebar__divider" aria-hidden="true" />

      {TOOL_GROUPS.map((group) => (
        <div key={group.id} className="sidebar__group">
          <p className="sidebar__group-label">{group.label}</p>
          <ul className="sidebar__list">
            {toolsByGroup(group.id).map((tool) => {
              const status = STATUS[tool.status]
              return (
                <li key={tool.id}>
                  <NavLink
                    to={tool.path}
                    className={({ isActive }) =>
                      cn('sidebar__link', isActive && 'sidebar__link--active')
                    }
                    onClick={onNavigate}
                  >
                    <span className="sidebar__link-main">
                      <Icon name={TOOL_GROUP_ICON[tool.group]} size="sm" />
                      <span className="sidebar__link-label">{tool.label}</span>
                    </span>
                    <span className={cn('sidebar__status', `sidebar__status--${status.state}`)}>
                      <span className="sidebar__status-dot" aria-hidden="true" />
                      <span className="sr-only">{status.label}</span>
                    </span>
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
