import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import AccueilView from './views/AccueilView'
import ModulesView from './views/ModulesView'
import ModuleView from './views/ModuleView'
import QuizView from './views/QuizView'
import CodexView from './views/CodexView'
import useStatsStore from './store/statsStore'
import { purgerBrouillons } from './lib/brouillons'
export default function App() {
  const { theme, loadData, loadProgression, ready, dataLoaded, dataError, progressionError, questions } = useStatsStore(useShallow(s => ({
    theme: s.theme, loadData: s.loadData, loadProgression: s.loadProgression, questions: s.questions,
    ready: s.ready, dataLoaded: s.dataLoaded, dataError: s.dataError, progressionError: s.progressionError })))
  const location = useLocation()
  useEffect(() => { void loadData(); void loadProgression() }, [loadData, loadProgression])
  useEffect(() => { if (dataLoaded) purgerBrouillons(questions) }, [dataLoaded, questions])
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
  }, [theme])
  // Le bouton de thème est placé dans l'en-tête de chaque écran (pas de barre globale).
  return <div className="h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
    {dataError || progressionError ? <div className="panel m-8" role="alert">
      <p>{dataError || progressionError}</p>
      <button className="button-primary mt-4" onClick={() => { void loadData(); void loadProgression() }}>Réessayer</button>
    </div> : !ready || !dataLoaded ? <p className="p-8" role="status">Chargement…</p> :
      <Routes>
        <Route path="/" element={<AccueilView/>}/>
        <Route path="/modules" element={<ModulesView/>}/>
        <Route path="/module/:moduleId" element={<ModuleView/>}/>
        <Route path="/quiz/:moduleId" element={<QuizView key={location.pathname + location.search}/>}/>
        <Route path="/statistiques" element={<Navigate to="/" replace/>}/>
        <Route path="/codex" element={<CodexView/>}/>
        <Route path="/lexique" element={<Navigate to="/codex" replace/>}/>
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>}
  </div>
}
