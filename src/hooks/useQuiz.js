import { useState, useEffect, useRef } from 'react'
import { tirerQuestions } from '../lib/quizSelection'
import { PREFIXE_BROUILLON } from '../lib/brouillons'

/**
 * Machine à états d'une session de QCM.
 * - Le tirage des questions ET l'ordre des choix sont figés dans le brouillon.
 * - Un brouillon déjà commencé n'est jamais repris en silence : `pendingResume`
 *   demande à l'utilisateur de reprendre ou de recommencer.
 */
export default function useQuiz({ moduleId, questions: pool, limit, sessionKey, onSaveSession }) {
  const draftKey = PREFIXE_BROUILLON + sessionKey
  const makeSession = ids => {
    const tirage = ids || tirerQuestions(pool, limit).map(q => q.id)
    const ordres = Object.fromEntries(tirage.map(id => {
      const q = pool.find(p => p.id === id)
      return [id, tirerQuestions(q.choix, 0).map(c => c.id)]
    }))
    return { id: crypto.randomUUID(), ids: tirage, ordres, index: 0, answers: {}, startedAt: Date.now(), finishing: false }
  }
  const [initial] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(draftKey))
      if (saved?.ids?.length && saved.ids.every(id => pool.some(q => q.id === id)) &&
          saved.index >= 0 && saved.index < saved.ids.length && saved.answers && saved.id) return { session: saved, restored: true }
    } catch { /* Un brouillon illisible n'empêche pas une nouvelle session. */ }
    return { session: makeSession(), restored: false }
  })
  const [session, setSession] = useState(initial.session)
  // Proposer la reprise seulement si au moins une réponse avait été donnée.
  const [pendingResume, setPendingResume] = useState(initial.restored && Object.keys(initial.session.answers).length > 0)
  const [showTip, setShowTip] = useState(false)
  const [sessionSummary, setSessionSummary] = useState(null)
  const [saveError, setSaveError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [draftError, setDraftError] = useState(null)
  const busy = useRef(false)

  const questionDe = id => pool.find(q => q.id === id)
  const currentQuestion = questionDe(session.ids[session.index])
  // Choix dans l'ordre mélangé du brouillon (ordre d'origine pour un ancien brouillon sans `ordres`).
  const ordre = session.ordres?.[currentQuestion?.id]
  const currentChoices = currentQuestion
    ? (ordre?.length === currentQuestion.choix.length
      ? ordre.map(id => currentQuestion.choix.find(c => c.id === id)).filter(Boolean)
      : currentQuestion.choix)
    : []
  const selectedChoice = session.answers[currentQuestion?.id]?.selectedChoice ?? null
  const isAnswered = selectedChoice !== null

  // Résultat de chaque question du tirage : 'correct' | 'incorrect' | null (non répondue)
  const results = session.ids.map(id => {
    const a = session.answers[id]
    if (!a) return null
    return a.selectedChoice === questionDe(id)?.reponse_correcte ? 'correct' : 'incorrect'
  })
  const correctCount = results.filter(r => r === 'correct').length
  const incorrectCount = results.filter(r => r === 'incorrect').length
  const mistakes = session.ids
    .filter((id, i) => results[i] === 'incorrect')
    .map(id => ({ question: questionDe(id), selectedChoice: session.answers[id].selectedChoice }))

  useEffect(() => {
    if (sessionSummary) return
    try { localStorage.setItem(draftKey, JSON.stringify(session)); setDraftError(null) }
    catch { setDraftError('Le brouillon ne peut pas être conservé. Terminez la session avant de fermer.') }
  }, [session, draftKey, sessionSummary])

  const finishSession = async () => {
    if (busy.current || sessionSummary) return
    busy.current = true; setIsSaving(true); setSaveError(null)
    const finished = { ...session, finishing: true,
      elapsedSeconds: session.elapsedSeconds || Math.max(1, Math.round((Date.now() - session.startedAt) / 1000)) }
    setSession(finished)
    try {
      // Le même ID est conservé après un échec ou une fermeture pendant l'envoi.
      localStorage.setItem(draftKey, JSON.stringify(finished))
      const result = await onSaveSession({ id: session.id, module_id: moduleId,
        duree_secondes: finished.elapsedSeconds, answers: Object.values(session.answers) })
      if (!result?.success) throw new Error(result?.error || 'Sauvegarde impossible.')
      setSessionSummary({ ...result.session, niveauAvant: result.niveauAvant ?? null, niveauApres: result.progression?.niveau ?? null })
      try { localStorage.removeItem(draftKey) } catch { /* ID déjà enregistré : nouvelle tentative sans doublon. */ }
    } catch (e) { setSaveError(e.message) }
    finally { busy.current = false; setIsSaving(false) }
  }
  const selectChoice = choice => {
    if (pendingResume || isAnswered || session.finishing || !currentQuestion?.choix.some(c => c.id === choice)) return
    setSession(prev => ({ ...prev, answers: { ...prev.answers,
      [currentQuestion.id]: { questionId: currentQuestion.id, selectedChoice: choice } } }))
  }
  const nextQuestion = () => {
    if (pendingResume || !isAnswered || busy.current) return
    if (session.index + 1 === session.ids.length) { void finishSession(); return }
    setSession(prev => ({ ...prev, index: prev.index + 1 })); setShowTip(false)
  }
  // Sans argument : nouveau tirage complet. Avec une liste d'ids : rejouer ces questions (ex. les erreurs).
  const restartQuiz = ids => {
    setSession(makeSession(Array.isArray(ids) && ids.length ? ids : undefined))
    setSessionSummary(null); setSaveError(null); setShowTip(false); setPendingResume(false)
  }
  return { currentIndex: session.index, currentQuestion, currentChoices, totalQuestions: session.ids.length,
    answeredCount: Object.keys(session.answers).length, results, correctCount, incorrectCount, mistakes,
    selectedChoice, isAnswered, showTip, isFinished: !!sessionSummary, sessionSummary,
    pendingResume, resumeSession: () => setPendingResume(false),
    selectChoice, toggleTip: () => setShowTip(v => !v), nextQuestion, restartQuiz,
    replayMistakes: () => restartQuiz(mistakes.map(m => m.question.id)),
    isSaving, saveError, draftError, retrySave: finishSession, finishing: session.finishing }
}
