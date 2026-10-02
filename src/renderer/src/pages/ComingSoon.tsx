import { Link, useLocation } from 'react-router-dom'
import { Alert } from '@/components/Alert'
import { Badge } from '@/components/Badge'
import { TOOL_STATUS, findToolByPath, type ToolDefinition } from '@/lib/routes'
import './ComingSoon.css'

/**
 * Halaman placeholder yang jujur untuk tool yang belum diimplementasikan.
 *
 * Aturan (Phase 1 §14, §29):
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
  const status = tool?.status ?? TOOL_STATUS.COMING_SOON

  return (
    <article className="coming-soon">
      <p className="coming-soon__eyebrow">{tool?.group.replace('-', ' ') ?? 'alat'}</p>
      <h1 className="coming-soon__title">{heading}</h1>
      <p className="coming-soon__lead">{tool?.description ?? 'Halaman ini belum tersedia.'}</p>

      <div className="coming-soon__status">
        <span className="coming-soon__status-label">Status:</span>
        <Badge tone="info">Coming Soon</Badge>
        <span className="coming-soon__status-value">{status}</span>
      </div>

      <Alert tone="info" title="Fitur ini belum tersedia pada versi saat ini.">
        <p>Tidak ada file yang diproses pada halaman ini.</p>
      </Alert>

      {tool && tool.plannedCapabilities.length > 0 ? (
        <section className="coming-soon__planned">
          <h2 className="coming-soon__planned-title">Direncanakan untuk tool ini</h2>
          <ul className="coming-soon__planned-list">
            {tool.plannedCapabilities.map((capability) => (
              <li key={capability}>{capability}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <Link className="coming-soon__back" to="/">
        Kembali ke Dashboard
      </Link>
    </article>
  )
}