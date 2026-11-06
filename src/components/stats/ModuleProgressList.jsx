import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, ChevronUp } from 'lucide-react'
import ModuleIcon from '../shared/ModuleIcon'
import PriorityBadge from '../shared/PriorityBadge'

const VISIBLES = 3

/**
 * Progression par module, sans tout afficher d'un coup : les modules commencés d'abord,
 * puis les autres par priorité. Trois lignes visibles, le reste derrière « Voir plus ».
 */
export default function ModuleProgressList({ rows }) {
  const [ouvert, setOuvert] = useState(false)
  const avec = rows.filter(l => l.stats.nbQuestions)
  const tries = [...avec.filter(l => l.stats.tentatives), ...avec.filter(l => !l.stats.tentatives)]
  const affiches = ouvert ? tries : tries.slice(0, VISIBLES)
  const caches = tries.length - VISIBLES

  return (
    <section className="panel" aria-labelledby="titre-par-module" data-testid="module-progress">
      <h2 id="titre-par-module" className="text-xl font-bold mb-4">
        Progression par module
      </h2>
      <ul className="divide-y divide-slate-200 dark:divide-slate-800">
        {affiches.map(({ module: m, stats: s }) => {
          const pct = Math.round((s.nbTravailles / (m.sous_modules.length || 1)) * 100)
          return (
            <li key={m.id}>
              <Link
                to={'/module/' + m.id}
                className="flex flex-wrap items-center gap-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 -mx-2"
              >
                <ModuleIcon icon={m.icon} color={m.couleur} />
                <div className="flex-1 min-w-[12rem]">
                  <p className="font-semibold">{m.label}</p>
                  <PriorityBadge priority={m.priorite} className="mt-1" />
                </div>
                <div className="w-44">
                  <p className="text-xs muted mb-1">
                    Étapes faites : {s.nbTravailles} / {m.sous_modules.length}
                  </p>
                  <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full bg-soleil" style={{ width: pct + '%' }} />
                  </div>
                </div>
                <p className="w-28 text-right font-semibold">
                  {s.tentatives ? (
                    Math.round(s.taux * 100) + ' %'
                  ) : (
                    <span className="muted font-normal text-sm">Pas encore commencé</span>
                  )}
                </p>
              </Link>
            </li>
          )
        })}
      </ul>
      {caches > 0 && (
        <button
          type="button"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          onClick={() => setOuvert(o => !o)}
          aria-expanded={ouvert}
          data-testid="module-progress-toggle"
        >
          {ouvert ? <ChevronUp size={16} aria-hidden="true" /> : <ChevronDown size={16} aria-hidden="true" />}
          {ouvert ? 'Voir moins' : 'Voir les ' + caches + ' autres modules'}
        </button>
      )}
    </section>
  )
}
