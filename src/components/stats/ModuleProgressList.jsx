import { Link } from 'react-router-dom'
import ModuleIcon from '../shared/ModuleIcon'
import { classePriorite } from '../../lib/priorites'

/** Progression de chaque module : étapes travaillées et réussite. Les modules sans question sont regroupés à la fin. */
export default function ModuleProgressList({ lignes }) {
  const avec = lignes.filter(l => l.stats.nbQuestions)
  const sans = lignes.filter(l => !l.stats.nbQuestions)
  return <section className="panel" aria-labelledby="titre-par-module">
    <h2 id="titre-par-module" className="text-xl font-bold mb-4">Progression par module</h2>
    <ul className="divide-y divide-slate-200 dark:divide-slate-800">
      {avec.map(({ module: m, stats: s }) => {
        const pct = Math.round(s.nbTravailles / (m.sous_modules.length || 1) * 100)
        return <li key={m.id}>
          <Link to={'/module/' + m.id} className="flex flex-wrap items-center gap-4 py-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 -mx-2">
            <ModuleIcon icon={m.icon} couleur={m.couleur}/>
            <div className="flex-1 min-w-[12rem]">
              <p className="font-semibold">{m.label}</p>
              <span className={classePriorite(m.priorite) + ' mt-1 inline-block'}>{m.priorite}</span>
            </div>
            <div className="w-44">
              <p className="text-xs muted mb-1">Étapes travaillées : {s.nbTravailles} / {m.sous_modules.length}</p>
              <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-soleil" style={{ width: pct + '%' }}/>
              </div>
            </div>
            <p className="w-28 text-right font-semibold">{s.tentatives ? Math.round(s.taux * 100) + ' %' : <span className="muted font-normal text-sm">Pas commencé</span>}</p>
          </Link>
        </li>
      })}
    </ul>
    {!!sans.length && <p className="muted text-sm mt-4">Questions à venir pour : {sans.map(l => l.module.label).join(', ')}.</p>}
  </section>
}
