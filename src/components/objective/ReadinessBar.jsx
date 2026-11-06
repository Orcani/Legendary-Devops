import { Check } from 'lucide-react'
import { REPERES } from '../../lib/objectif'

/**
 * Barre « Quand postuler ? » : moyenne des étapes indispensables du poste, avec trois repères.
 * Un repère est coché quand il est atteint (le calcul tient aussi compte des étapes bloquantes).
 */
export default function ReadinessBar({ value, reached }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)
  const rangAtteint = reached ? REPERES.findIndex(r => r.id === reached.id) : -1
  return (
    <div>
      <div
        className="relative h-4 rounded-full bg-slate-200 dark:bg-slate-800"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Avancée vers le poste"
      >
        <div className="h-full rounded-full bg-soleil transition-all duration-700" style={{ width: pct + '%' }} />
        {REPERES.map(r => (
          <span
            key={r.id}
            aria-hidden="true"
            className="absolute top-0 h-full w-0.5 bg-white/80 dark:bg-slate-950/80"
            style={{ left: r.seuil * 100 + '%' }}
          />
        ))}
      </div>
      <ol className="relative h-10 mt-2 text-xs">
        {REPERES.map((r, i) => {
          const atteint = i <= rangAtteint
          return (
            <li
              key={r.id}
              className="absolute -translate-x-1/2 text-center whitespace-nowrap"
              style={{ left: r.seuil * 100 + '%' }}
            >
              <span
                className={
                  'inline-flex items-center gap-1 font-semibold ' +
                  (atteint ? 'text-soleil-fonce dark:text-soleil' : 'muted')
                }
              >
                {atteint && <Check size={14} aria-hidden="true" />}
                {r.libelle}
              </span>
              <span className="block muted">
                {Math.round(r.seuil * 100)} %{atteint ? ' · atteint' : ''}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
