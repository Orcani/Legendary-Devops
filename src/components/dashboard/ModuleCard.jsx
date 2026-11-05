import { Link } from 'react-router-dom'
import ModuleIcon from '../shared/ModuleIcon'
import { classePriorite } from '../../lib/priorites'
import { pluriel } from '../../lib/format'

/** Carte d'un module : identité, contenu disponible, étapes travaillées et réussite. */
export default function ModuleCard({ module: mod, stats: s }) {
  const vide = !s.nbQuestions
  const pct = Math.round(s.nbTravailles / (mod.sous_modules.length || 1) * 100)
  return <Link to={'/module/' + mod.id} data-testid={'module-' + mod.id}
    className={'panel relative overflow-hidden flex flex-col transition-colors hover:border-blue-500 dark:hover:border-blue-500 ' +
      (vide ? '!border-dashed !bg-transparent' : '')}>
    {!vide && <span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: mod.couleur }} aria-hidden="true"/>}
    <div className="flex items-start justify-between gap-3">
      <ModuleIcon icon={mod.icon} couleur={mod.couleur}/>
      <span className={classePriorite(mod.priorite)}>{mod.priorite}</span>
    </div>
    <h3 className="text-lg font-bold mt-4">{mod.label}</h3>
    <p className="muted text-sm mt-2 flex-1">{mod.description}</p>
    {vide ? <p className="mt-5 text-sm font-semibold muted">Questions à venir</p> : <div className="mt-5">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="muted">{pluriel(s.nbQuestions, 'question')}</span>
        <span className="muted">
          {s.tentatives ? Math.round(s.taux * 100) + ' % de réussite' : 'Pas encore commencé'}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden" title={'Étapes travaillées : ' + s.nbTravailles + ' / ' + mod.sous_modules.length}>
        <div className="h-full rounded-full bg-soleil" style={{ width: pct + '%' }}/>
      </div>
      <p className="muted text-xs mt-1.5">Étapes travaillées : {s.nbTravailles} / {mod.sous_modules.length}</p>
    </div>}
  </Link>
}
