import { classePriorite } from '../../lib/priorites'
import { LIBELLES_PRIORITE } from '../../lib/format'

/**
 * Badge P1 / P2 / P3 avec son sens : info-bulle au survol et texte lu par les lecteurs d'écran.
 * `withLabel` affiche aussi le sens à côté du badge (légende visible).
 * `align="end"` ouvre l'info-bulle vers la gauche (badge placé à droite d'une carte, pour qu'elle ne soit pas coupée).
 */
export default function PriorityBadge({ priority, withLabel = false, align = 'start', className = '' }) {
  const sens = LIBELLES_PRIORITE[priority] || ''
  return (
    <span className={'group relative inline-flex items-center gap-2 ' + className}>
      <span className={classePriorite(priority)} aria-hidden="true">
        {priority}
      </span>
      <span className="sr-only">
        Priorité {priority} : {sens}
      </span>
      {withLabel ? (
        <span className="muted text-sm" aria-hidden="true">
          {sens}
        </span>
      ) : (
        <span
          role="tooltip"
          aria-hidden="true"
          className={
            'pointer-events-none absolute top-full z-30 mt-2 w-max max-w-[16rem] rounded-lg bg-encre px-3 py-2 text-sm font-medium leading-snug text-white opacity-0 shadow-xl ring-1 ring-black/10 transition-opacity group-hover:opacity-100 dark:bg-white dark:text-encre ' +
            (align === 'end' ? 'right-0' : 'left-0')
          }
        >
          {priority} : {sens}
        </span>
      )}
    </span>
  )
}
