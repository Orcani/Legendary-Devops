import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { RotateCcw } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import useStatsStore from '../store/statsStore'
import { statsModule, statsGlobales, pointsFaibles } from '../lib/stats'
import { prochaineEtape } from '../lib/parcours'
import { brouillonsEnCours } from '../lib/brouillons'
import AppHeader from '../components/shared/AppHeader'
import NextStepCard from '../components/journey/NextStepCard'
import LevelCard from '../components/stats/LevelCard'
import OverviewCard from '../components/stats/OverviewCard'
import WeakPointsPanel from '../components/stats/WeakPointsPanel'
import ModuleProgressList from '../components/stats/ModuleProgressList'
import RecentSessions from '../components/stats/RecentSessions'
import ConfirmDialog from '../components/shared/ConfirmDialog'

const RANG = { P1: 1, P2: 2, P3: 3 }

/** Mon parcours : prochaine étape conseillée, progression, points à revoir et dernières sessions. */
export default function JourneyView() {
  const navigate = useNavigate()
  const [confirmation, setConfirmation] = useState(false)
  const [enCours, setEnCours] = useState(false)
  const resetProgress = useStatsStore(st => st.resetProgress)
  const s = useStatsStore(
    useShallow(st => ({
      modules: st.modules,
      questions: st.questions,
      resultats: st.resultats_par_question,
      sessions: st.sessions,
      statsSousModules: st.stats_par_sous_module,
      niveau: st.niveau,
      xpTotal: st.xp_total,
      xpNiveau: st.xp_niveau_actuel,
      xpSuivant: st.xp_pour_niveau_suivant,
      comprendreVus: st.comprendre_vus,
      introVue: st.intro_vue,
    })),
  )
  // Premier lancement : l'écran « Par où commencer ? » d'abord.
  if (!s.introVue && !s.sessions.length && !s.comprendreVus.length) return <Navigate to="/bienvenue" replace />

  const globales = statsGlobales(s.modules, s.questions, s.resultats, s.sessions)
  const faibles = pointsFaibles(s.modules, s.questions, s.resultats, s.statsSousModules)
  const etape = prochaineEtape({
    modules: s.modules,
    questions: s.questions,
    resultats: s.resultats,
    comprendreVus: s.comprendreVus,
    brouillons: brouillonsEnCours(),
  })
  const suggestion = s.modules.find(m => m.priorite === 'P1' && s.questions.some(q => q.module_id === m.id))
  const rows = [...s.modules]
    .sort((a, b) => RANG[a.priorite] - RANG[b.priorite])
    .map(m => ({ module: m, stats: statsModule(m, s.questions, s.resultats) }))

  return (
    <main className="page">
      <div className="max-w-6xl mx-auto">
        <AppHeader
          title="Mon parcours"
          subtitle="Ce que tu as déjà fait et ce qui vient ensuite. Tu peux faire une pause quand tu veux, rien ne se perd."
        />
        <div className="space-y-5">
          <NextStepCard step={etape} />
          <div className="grid lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 grid">
              <LevelCard level={s.niveau} totalXp={s.xpTotal} levelXp={s.xpNiveau} nextLevelXp={s.xpSuivant} />
            </div>
            <OverviewCard stats={globales} />
          </div>
          <WeakPointsPanel points={faibles} hasStarted={globales.tentatives > 0} suggestion={suggestion} />
          <ModuleProgressList rows={rows} />
          <RecentSessions sessions={s.sessions} modules={s.modules} />
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sm">
          <Link className="text-blue-600 dark:text-blue-400 hover:underline" to="/bienvenue">
            Relire « Par où commencer ? »
          </Link>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 muted hover:underline"
            onClick={() => setConfirmation(true)}
            data-testid="reset-progress"
          >
            <RotateCcw size={14} aria-hidden="true" />
            Repartir de zéro
          </button>
        </div>
        {confirmation && (
          <ConfirmDialog
            title="Repartir de zéro ?"
            confirmLabel="Oui, tout effacer"
            cancelLabel="Non, je garde tout"
            busy={enCours}
            onCancel={() => setConfirmation(false)}
            onConfirm={async () => {
              setEnCours(true)
              const r = await resetProgress()
              setEnCours(false)
              setConfirmation(false)
              if (r.success) navigate('/bienvenue')
            }}
          >
            Tes XP, ton niveau, tes sessions, tes résultats et les leçons déjà lues seront effacés. On ne pourra pas
            revenir en arrière. Le thème jour ou nuit, lui, est gardé.
          </ConfirmDialog>
        )}
      </div>
    </main>
  )
}
