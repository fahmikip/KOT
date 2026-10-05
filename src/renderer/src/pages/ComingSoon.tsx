import { Link, useLocation } from 'react-router-dom'
import { Alert } from '@/components/Alert'
import { Badge } from '@/components/Badge'
import { Card } from '@/components/Card'
import { Icon } from '@/components/Icon'
import { PageHeader } from '@/components/PageHeader'
import { DASHBOARD_ROUTE, TOOL_GROUPS, TOOL_STATUS, findToolByPath } from '@/lib/routes'
import type { ToolDefinition } from '@/lib/routes'
import './ComingSoon.css'

/**
 * Halaman placeholder yang jujur untuk tool yang belum diimplementasikan.
 *
 * Aturan (ARCHITECTURE.md §4, §14):
 * - Tidak ada tombol aksi yang tidak melakukan apa pun.
 * - Tidak ada input file di halaman ini — tidak ada file yang diproses.
 * - Kemampuan yang ditampilkan berasal dari FEATURES.md, ditulis sebagai
 *   "direncanakan", bukan sebagai kemampuan yang sudah tersedia.
 */
export function ComingSoon() {
  const { pathname } = useLocation()
  const tool = findToolByPath(pathname)

  if (!tool) {
    // Route ada di daftar tapi tool tidak ditemukan — jaga agar tidak crash.
    return <ComingSoonBody title="Tool tidak ditemukan" />
  }

  return <ComingSoonBody tool={tool} />
}

interface ComingSoonBodyProps {
  tool?: ToolDefinition
  title?: string
}

function ComingSoonBody({ tool, title }: ComingSoonBodyProps) {
  const heading = tool ? tool.label : (title ?? 'Tool')
  const isReady = tool?.status === TOOL_STATUS.READY
  const groupLabel = tool
    ? (TOOL_GROUPS.find((group) => group.id === tool.group)?.label ?? 'Alat')
    : 'Alat'

  return (
    <article className="coming-soon">
      <PageHeader
        eyebrow={groupLabel}
        title={heading}
        description={tool?.description ?? 'Halaman ini belum tersedia.'}
        aside={<Badge tone={isReady ? 'accent' : 'neutral'}>{isReady ? 'Siap digunakan' : 'Coming Soon'}</Badge>}
      />

      {!isReady ? (
        <Alert tone="info" title="Fitur ini belum tersedia pada versi saat ini.">
          <p>Tidak ada file yang diproses pada halaman ini.</p>
        </Alert>
      ) : null}

      {tool && tool.plannedCapabilities.length > 0 ? (
        <Card as="section" className="coming-soon__planned">
          <h2 className="coming-soon__planned-title">Direncanakan untuk tool ini</h2>
          <ul className="coming-soon__planned-list">
            {tool.plannedCapabilities.map((capability) => (
              <li key={capability} className="coming-soon__planned-item">
                <span className="coming-soon__planned-mark" aria-hidden="true">
                  <Icon name="check" size="sm" />
                </span>
                <span>{capability}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      <div className="coming-soon__actions">
        <Link className="link-button" to={DASHBOARD_ROUTE}>
          <Icon name="arrow-left" size="sm" />
          <span>Kembali ke Dashboard</span>
        </Link>
      </div>
    </article>
  )
}
