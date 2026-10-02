import { Link } from 'react-router-dom'
import { Card } from '@/components/Card'
import { Badge } from '@/components/Badge'
import { TOOL_GROUPS, TOOL_STATUS, toolsByGroup, type ToolStatus } from '@/lib/routes'
import './Dashboard.css'

const STATUS_BADGE: Record<ToolStatus, { label: string; tone: 'neutral' | 'accent' }> = {
  [TOOL_STATUS.COMING_SOON]: { label: 'Coming Soon', tone: 'neutral' },
  [TOOL_STATUS.READY]: { label: 'Siap', tone: 'accent' }
}

/**
 * Dashboard.
 *
 * SENGaja tanpa statistik, chart, atau angka palsu (Phase 1 §8 dan §20).
 * Hanya daftar kategori dan tool-nya. Tidak ada "recently used" karena state
 * management-nya belum didefinisikan (DEC-018 masih UNDEFINED).
 */
export function Dashboard() {
  return (
    <div className="dashboard">
      {/*
        Bukan <header>: elemen itu memetakan ke landmark "banner" dan akan
        bentrok dengan <header> aplikasi pada AppLayout.
      */}
      <div className="dashboard__header">
        <p className="dashboard__eyebrow">KPU OFFICE TOOLS</p>
        <h1 className="dashboard__title">Alat bantu sederhana untuk pekerjaan file dan dokumen.</h1>
        <p className="dashboard__subtitle">Pilih alat yang ingin digunakan.</p>
      </div>

      <div className="dashboard__grid">
        {TOOL_GROUPS.map((group) => {
          const tools = toolsByGroup(group.id)
          return (
            <Card key={group.id} as="section" className="dashboard__card">
              <h2 className="dashboard__card-title">{group.label}</h2>
              <p className="dashboard__card-description">{group.description}</p>

              <ul className="dashboard__tool-list">
                {tools.map((tool) => (
                  <li key={tool.id}>
                    <Link className="dashboard__tool-link" to={tool.path}>
                      {tool.label}
                    </Link>
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