import { Link } from 'react-router-dom'
import { Badge } from '@/components/Badge'
import { Card } from '@/components/Card'
import { Icon } from '@/components/Icon'
import { PageHeader } from '@/components/PageHeader'
import { TOOL_GROUPS, TOOL_STATUS, toolsByGroup, type ToolStatus } from '@/lib/routes'
import { TOOL_GROUP_ICON } from '@/lib/toolIcons'
import './Dashboard.css'

const STATUS_BADGE: Record<ToolStatus, { label: string; tone: 'neutral' | 'accent' }> = {
  [TOOL_STATUS.COMING_SOON]: { label: 'Coming Soon', tone: 'neutral' },
  [TOOL_STATUS.READY]: { label: 'Siap', tone: 'accent' }
}

/**
 * Dashboard.
 *
 * SENGaja tanpa statistik, chart, atau angka palsu (ARCHITECTURE.md §5, §13).
 * Hanya daftar kategori dan tool-nya. Tidak ada "recently used" karena state
 * management-nya belum didefinisikan (DEC-018 masih UNDEFINED).
 *
 * Tool yang belum aktif tetap dapat diklik dan tetap menulis statusnya secara
 * eksplisit — tidak ada halaman yang berpura-pura sudah berfungsi.
 */
export function Dashboard() {
  return (
    <div className="dashboard">
      <PageHeader
        eyebrow="Semua alat"
        title="Alat bantu sederhana untuk pekerjaan file dan dokumen."
        description="Pilih alat yang ingin digunakan."
      />

      <div className="dashboard__grid">
        {TOOL_GROUPS.map((group) => {
          const tools = toolsByGroup(group.id)
          return (
            <Card key={group.id} as="section" className="dashboard__card">
              <div className="dashboard__card-head">
                <span className="dashboard__card-icon" aria-hidden="true">
                  <Icon name={TOOL_GROUP_ICON[group.id]} />
                </span>
                <div className="dashboard__card-heading">
                  <h2 className="dashboard__card-title">{group.label}</h2>
                  <p className="dashboard__card-description">{group.description}</p>
                </div>
              </div>

              <ul className="dashboard__tool-list">
                {tools.map((tool) => (
                  <li key={tool.id} className="dashboard__tool">
                    <Link className="dashboard__tool-link" to={tool.path}>
                      <span className="dashboard__tool-name">{tool.label}</span>
                      <Icon name="arrow-right" size="sm" className="dashboard__tool-arrow" />
                    </Link>
                    <p className="dashboard__tool-description">{tool.description}</p>
                    <Badge tone={STATUS_BADGE[tool.status].tone}>
                      {STATUS_BADGE[tool.status].label}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
