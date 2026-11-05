import { useShallow } from 'zustand/react/shallow'
import useStatsStore from '../store/statsStore'
import { statsModule, statsGlobales, pointsFaibles } from '../lib/stats'
import AppHeader from '../components/shared/AppHeader'
import LevelCard from '../components/stats/LevelCard'
import OverviewCard from '../components/stats/OverviewCard'
import WeakPointsPanel from '../components/stats/WeakPointsPanel'
import ModuleProgressList from '../components/stats/ModuleProgressList'
import RecentSessions from '../components/stats/RecentSessions'

const RANG = { P1: 1, P2: 2, P3: 3 }

/** Accueil : progression, points à revoir, avancement par module et dernières sessions. */
export default function AccueilView() {
  const s = useStatsStore(useShallow(st => ({
    modules: st.modules, questions: st.questions, resultats: st.resultats_par_question, sessions: st.sessions,
    statsSousModules: st.stats_par_sous_module, niveau: st.niveau, xp_total: st.xp_total,
    xp_niveau_actuel: st.xp_niveau_actuel, xp_pour_niveau_suivant: st.xp_pour_niveau_suivant })))
  const globales = statsGlobales(s.modules, s.questions, s.resultats, s.sessions)
  const faibles = pointsFaibles(s.modules, s.questions, s.resultats, s.statsSousModules)
  const suggestion = s.modules.find(m => m.priorite === 'P1' && s.questions.some(q => q.module_id === m.id))
  const lignes = [...s.modules].sort((a, b) => RANG[a.priorite] - RANG[b.priorite])
    .map(m => ({ module: m, stats: statsModule(m, s.questions, s.resultats) }))

  return <main className="page">
    <div className="max-w-6xl mx-auto">
      <AppHeader titre="Accueil" sousTitre="Où vous en êtes, ce qui mérite d’être revu et vos dernières sessions. Rien ne se perd si vous faites une pause."/>
      <div className="grid lg:grid-cols-3 gap-5 mb-5">
        <div className="lg:col-span-2 grid"><LevelCard niveau={s.niveau} xpTotal={s.xp_total}
          xpNiveau={s.xp_niveau_actuel} xpSuivant={s.xp_pour_niveau_suivant}/></div>
        <OverviewCard stats={globales}/>
      </div>
      <div className="space-y-5">
        <WeakPointsPanel points={faibles} aCommence={globales.tentatives > 0} suggestion={suggestion}/>
        <ModuleProgressList lignes={lignes}/>
        <RecentSessions sessions={s.sessions} modules={s.modules}/>
      </div>
    </div>
  </main>
}
