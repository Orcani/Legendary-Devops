import { useCallback, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { History } from 'lucide-react'
import useStatsStore from '../store/statsStore'
import useQuiz from '../hooks/useQuiz'
import { questionPool } from '../lib/quizSelection'
import SidebarQuiz from '../components/quiz/SidebarQuiz'
import QuestionCard from '../components/quiz/QuestionCard'
import QuizSummary from '../components/quiz/QuizSummary'
import CodexModal from '../components/codex/CodexModal'

export default function QuizView() {
  const { moduleId } = useParams()
  const [params] = useSearchParams()
  const { modules, questions, resultats_par_question, saveSession } = useStatsStore(useShallow(s => ({
    modules: s.modules, questions: s.questions, resultats_par_question: s.resultats_par_question, saveSession: s.saveSession })))
  const module = modules.find(m => m.id === moduleId)
  const submoduleId = params.get('submodule')
  const scope = params.get('scope') === 'seen' ? 'seen' : 'all'
  const mode = params.get('mode') === 'short' ? 'short' : 'long'
  // La sélection reste figée pendant la session, même lorsque la sauvegarde actualise les stats.
  const [pool] = useState(() => questionPool({ questions, modules, resultats: resultats_par_question, moduleId, sousModuleId: submoduleId, scope }))
  const [codexTerm, setCodexTerm] = useState(null)
  const closeCodex = useCallback(() => setCodexTerm(null), [])
  const label = submoduleId ? module?.sous_modules.find(sm => sm.id === submoduleId)?.label : module?.label
  const quiz = useQuiz({ moduleId, questions: pool, limit: mode === 'short' ? 10 : 0,
    sessionKey: [moduleId, submoduleId || '', scope, mode].join(':'), onSaveSession: saveSession })

  if (!pool.length) return <main className="page"><h1 className="text-2xl font-bold">Aucune question disponible</h1>
    <Link className="button-primary mt-4" to={module ? '/module/' + moduleId : '/'}>Retour au module</Link></main>

  // Bilan : pleine largeur, sans la sidebar de progression.
  if (quiz.isFinished) return <main className="page">
    <QuizSummary summary={quiz.sessionSummary} moduleLabel={label} moduleId={moduleId} mistakes={quiz.mistakes}
      onRestart={quiz.restartQuiz} onReplayMistakes={quiz.replayMistakes}/>
    {codexTerm && <CodexModal key={codexTerm} termId={codexTerm} onClose={closeCodex}/>}
  </main>

  // Session interrompue : reprendre ou recommencer, jamais de reprise silencieuse.
  if (quiz.pendingResume) return <main className="page flex items-center justify-center">
    <section className="panel max-w-lg w-full text-center" data-testid="resume-prompt">
      <History size={32} className="mx-auto text-blue-500" aria-hidden="true"/>
      <h1 className="text-2xl font-bold mt-4">Une session est en cours</h1>
      <p className="muted mt-2">{label} : vous avez répondu à {quiz.answeredCount} question{quiz.answeredCount > 1 ? 's' : ''} sur {quiz.totalQuestions} lors de votre dernière visite.</p>
      <div className="flex flex-wrap justify-center gap-3 mt-6">
        <button className="button-primary" onClick={quiz.resumeSession} autoFocus>Reprendre la session</button>
        <button className="button-secondary" onClick={() => quiz.restartQuiz()}>Recommencer à zéro</button>
      </div>
    </section>
  </main>

  return <div className="flex-1 flex min-h-0 overflow-hidden">
    <SidebarQuiz moduleLabel={label} moduleId={moduleId} currentIndex={quiz.currentIndex} totalQuestions={quiz.totalQuestions}
      answeredCount={quiz.answeredCount} results={quiz.results} correctCount={quiz.correctCount} incorrectCount={quiz.incorrectCount}
      difficulte={quiz.currentQuestion?.difficulte}
      astuce={quiz.currentQuestion?.astuce} showTip={quiz.showTip} onToggleTip={quiz.toggleTip}/>
    {/* Colonne : zone de question défilante + barre d'action fixe en bas, toujours visible. */}
    <main className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
          {quiz.draftError && <p role="alert" className="mb-4">{quiz.draftError}</p>}
          <QuestionCard question={quiz.currentQuestion} choices={quiz.currentChoices} selectedChoice={quiz.selectedChoice}
            onSelectChoice={quiz.selectChoice} onOpenCodex={setCodexTerm}/>
          {quiz.saveError && <div role="alert" className="panel mt-6"><p>Échec de sauvegarde : {quiz.saveError}</p>
            <button className="button-primary mt-3" onClick={quiz.retrySave} disabled={quiz.isSaving}>Réessayer la sauvegarde</button></div>}
        </div>
      </div>
      <footer className="shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-6 md:px-10 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <p className="muted text-sm">{quiz.isAnswered ? '' : 'Choisissez une réponse pour continuer.'}</p>
          <button className="button-primary" disabled={!quiz.isAnswered || quiz.isSaving}
            onClick={quiz.nextQuestion}>
            {quiz.isSaving ? 'Sauvegarde…' : quiz.finishing ? 'Réessayer la sauvegarde' :
              quiz.currentIndex + 1 === quiz.totalQuestions ? 'Terminer la session' : 'Question suivante'}
          </button>
        </div>
      </footer>
    </main>
    {codexTerm && <CodexModal key={codexTerm} termId={codexTerm} onClose={closeCodex}/>}
  </div>
}
