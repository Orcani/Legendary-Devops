import AnswerChoice from './AnswerChoice'
import FeedbackPanel from './FeedbackPanel'

const LETTRES = ['A', 'B', 'C', 'D']

/**
 * Carte centrale d'une question de QCM :
 * - Énoncé (le thème est géré par les variantes `dark:`)
 * - Les 4 choix, dans l'ordre mélangé de la session, repérés par A–D
 * - Encart de feedback ouvrant la modale Codex in-situ
 */
export default function QuestionCard({
  question,
  choices,
  selectedChoice = null,
  onSelectChoice = () => {},
  onOpenCodex = () => {},
}) {
  if (!question) return null

  const isAnswered = selectedChoice !== null
  const isCorrect = isAnswered && selectedChoice === question.reponse_correcte
  const liste = choices?.length ? choices : question.choix

  return (
    <div className="w-full">
      {/* Énoncé de la question */}
      <h2 className="text-2xl md:text-3xl font-extrabold leading-snug tracking-tight mb-8 text-slate-900 dark:text-white">
        {question.enonce}
      </h2>

      {/* Les 4 cadres de choix */}
      <div className="space-y-3.5">
        {liste.map((choix, i) => (
          <AnswerChoice
            key={choix.id}
            choice={choix}
            letter={LETTRES[i]}
            isSelected={selectedChoice === choix.id}
            isCorrect={choix.id === question.reponse_correcte}
            isAnswered={isAnswered}
            onSelect={onSelectChoice}
          />
        ))}
      </div>

      {/* Encart de correction vert / rouge après réponse */}
      {isAnswered && (
        <FeedbackPanel
          isCorrect={isCorrect}
          seed={question.id}
          correctExplanation={question.explication_correcte}
          errorExplanation={question.explication_erreur}
          codexTerms={question.termes_lexique || []}
          onOpenCodex={onOpenCodex}
        />
      )}
    </div>
  )
}
