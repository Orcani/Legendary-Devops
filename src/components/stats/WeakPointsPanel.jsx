import { Link } from 'react-router-dom'
import { CircleCheck, Compass } from 'lucide-react'
import ModuleIcon from '../shared/ModuleIcon'
import { pluriel } from '../../lib/format'

const MAX_AFFICHES = 5

/**
 * Sous-modules sous 70 % de réussite, du plus urgent au moins urgent.
 * Sans point faible : propose de commencer (aucune réponse) ou félicite.
 */
export default function WeakPointsPanel({ points, aCommence, suggestion }) {
  return <section className="panel" aria-labelledby="titre-points-faibles" data-testid="weak-points">
    <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
      <h2 id="titre-points-faibles" className="text-xl font-bold">À retravailler</h2>
      <p className="muted text-sm">Sous-modules sous 70 % de réussite</p>
    </div>

    {points.length ? <ul className="divide-y divide-slate-200 dark:divide-slate-800">
      {points.slice(0, MAX_AFFICHES).map(p => <li key={p.sousModule.id} className="flex flex-wrap items-center gap-4 py-3 first:pt-0 last:pb-0">
        <ModuleIcon icon={p.module.icon} couleur={p.module.couleur}/>
        <div className="flex-1 min-w-[12rem]">
          <p className="font-semibold">{p.sousModule.label}</p>
          <p className="muted text-sm">{p.module.label}</p>
        </div>
        <div className="w-32">
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">{Math.round(p.taux * 100)} % de réussite</p>
          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="h-full rounded-full bg-amber-500" style={{ width: Math.max(4, Math.round(p.taux * 100)) + '%' }}/>
          </div>
        </div>
        <Link className="button-primary" to={'/quiz/' + p.module.id + '?submodule=' + p.sousModule.id + '&mode=long'}>Réviser</Link>
      </li>)}
      {points.length > MAX_AFFICHES && <li className="pt-3 text-sm muted">
        Et {pluriel(points.length - MAX_AFFICHES, 'autre sous-module', 'autres sous-modules')} à revoir, visibles dans chaque module.
      </li>}
    </ul> : !aCommence ? <div className="flex flex-wrap items-center gap-4">
      <Compass size={28} className="text-blue-500 shrink-0" aria-hidden="true"/>
      <p className="flex-1 min-w-[14rem]">Pas encore de résultats. Après vos premières sessions, les sous-modules à revoir apparaîtront ici. Vous pouvez commencer par un module P1.</p>
      {suggestion && <Link className="button-primary" to={'/module/' + suggestion.id}>Commencer par {suggestion.label}</Link>}
    </div> : <p className="flex items-center gap-3">
      <CircleCheck size={22} className="text-emerald-500 shrink-0" aria-hidden="true"/>
      Rien à retravailler pour l’instant : tous les sous-modules travaillés dépassent 70 % de réussite.
    </p>}
  </section>
}
