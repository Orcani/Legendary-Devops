import { useShallow } from 'zustand/react/shallow'
import useStatsStore from '../store/statsStore'
import { classePriorite } from '../lib/priorites'
import { LIBELLES_PRIORITE } from '../lib/format'
import { statsModule } from '../lib/stats'
import AppHeader from '../components/shared/AppHeader'
import ModuleCard from '../components/dashboard/ModuleCard'

const PRIORITES = ['P1', 'P2', 'P3']

/** Écran d'exploration : uniquement les modules, regroupés par priorité. Les chiffres sont sur l'accueil. */
export default function ModulesView() {
  const { modules, questions, resultats } = useStatsStore(useShallow(st => ({
    modules: st.modules, questions: st.questions, resultats: st.resultats_par_question })))
  const groupes = PRIORITES.map(p => ({ priorite: p, modules: modules.filter(m => m.priorite === p) })).filter(g => g.modules.length)

  return <main className="page">
    <div className="max-w-6xl mx-auto">
      <AppHeader titre="Modules" sousTitre="Classés par priorité de candidature. Choisissez un module pour voir son parcours."/>
      <div className="space-y-10">
        {groupes.map(g => <section key={g.priorite} aria-labelledby={'prio-' + g.priorite}>
          <div className="flex items-center gap-3 mb-4">
            <span className={classePriorite(g.priorite)}>{g.priorite}</span>
            <h2 id={'prio-' + g.priorite} className="text-lg font-bold">{LIBELLES_PRIORITE[g.priorite]}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {g.modules.map(mod => <ModuleCard key={mod.id} module={mod} stats={statsModule(mod, questions, resultats)}/>)}
          </div>
        </section>)}
      </div>
    </div>
  </main>
}
