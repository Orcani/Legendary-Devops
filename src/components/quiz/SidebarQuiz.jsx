import { Link } from 'react-router-dom'
import { Check, X, Lightbulb } from 'lucide-react'
import TipPanel from './TipPanel'
import ThemeToggle from '../shared/ThemeToggle'
import { LIBELLES_DIFFICULTE } from '../../lib/format'

const STYLES_PASTILLE = {
  correct: 'bg-emerald-500',
  incorrect: 'bg-rose-500',
  courant: 'bg-white ring-2 ring-blue-500 dark:bg-slate-900',
  avenir: 'bg-slate-200 dark:bg-slate-700',
}
const STYLES_DIFFICULTE = {
  debutant: 'bg-emerald-500',
  intermediaire: 'bg-amber-500',
  avance: 'bg-rose-500',
}

export default function SidebarQuiz({ moduleLabel, moduleId, currentIndex, totalQuestions, answeredCount, results = [],
  correctCount = 0, incorrectCount = 0, difficulte, astuce, showTip, onToggleTip }) {
  // La barre reflète les questions répondues, pas la position : 0 % avant la première réponse.
  const pct = totalQuestions ? Math.round(answeredCount / totalQuestions * 100) : 0
  return <aside className="w-64 lg:w-80 shrink-0 p-5 md:p-7 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto flex flex-col">
    <Link className="text-blue-600 dark:text-blue-400 text-sm font-medium" to={moduleId ? '/module/' + moduleId : '/'}>← Quitter vers le module</Link>
    <h1 className="text-xl font-bold mt-6 mb-6">{moduleLabel}</h1>

    <p className="muted text-sm">Question</p>
    <p className="text-3xl font-bold mt-1 mb-3">{currentIndex + 1} / {totalQuestions}</p>
    <div className="h-2 rounded bg-slate-200 dark:bg-slate-800 overflow-hidden" role="progressbar"
      aria-label="Questions répondues" aria-valuemin={0} aria-valuemax={totalQuestions} aria-valuenow={answeredCount}>
      <div className="h-full bg-soleil transition-all duration-300" style={{ width: pct + '%' }}/></div>

    {/* Une pastille par question : verte, rouge, en cours ou à venir */}
    {totalQuestions <= 40 && <ol className="flex flex-wrap gap-1.5 mt-4" aria-label="Résultat par question">
      {results.map((r, i) => {
        const etat = r || (i === currentIndex ? 'courant' : 'avenir')
        const libelle = 'Question ' + (i + 1) + ' : ' + (r === 'correct' ? 'juste' : r === 'incorrect' ? 'fausse' : i === currentIndex ? 'en cours' : 'à venir')
        return <li key={i} title={libelle} aria-label={libelle} className={'w-3 h-3 rounded-full ' + STYLES_PASTILLE[etat]}/>
      })}
    </ol>}

    <div className="flex gap-4 mt-4 text-sm font-semibold" aria-label="Score">
      <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400"><Check size={16} aria-hidden="true"/>{correctCount} juste{correctCount > 1 ? 's' : ''}</span>
      <span className="inline-flex items-center gap-1 text-rose-700 dark:text-rose-400"><X size={16} aria-hidden="true"/>{incorrectCount} fausse{incorrectCount > 1 ? 's' : ''}</span>
    </div>

    {difficulte && <p className="mt-4 text-sm inline-flex items-center gap-2 muted">
      <span className={'w-2 h-2 rounded-full ' + (STYLES_DIFFICULTE[difficulte] || 'bg-slate-400')} aria-hidden="true"/>
      Niveau {LIBELLES_DIFFICULTE[difficulte]?.toLowerCase() || difficulte}
    </p>}

    <button className="button-secondary w-full mt-8" disabled={!astuce} onClick={onToggleTip} aria-expanded={!!astuce && showTip}>
      <Lightbulb size={16} aria-hidden="true"/>
      {astuce ? showTip ? 'Masquer l’astuce' : 'Astuce DevOps' : 'Aucune astuce'}
    </button>
    <TipPanel astuce={astuce} isVisible={showTip}/>

    <div className="mt-auto pt-8 space-y-4">
      <p className="text-xs muted">Les XP sont attribués à la fin de la session.</p>
      <ThemeToggle className="w-full"/>
    </div>
  </aside>
}
