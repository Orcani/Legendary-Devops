import { motion } from 'framer-motion'
import { CheckCircle2, XCircle } from 'lucide-react'

/**
 * Cadre de réponse individuel (1 parmi les 4 choix).
 * Le thème est géré par les variantes `dark:` de Tailwind (darkMode: 'class') :
 * aucun abonnement au store n'est nécessaire.
 */
const STYLES = {
  // État neutre interactif
  neutre:
    'bg-white border-slate-200 text-slate-800 hover:border-blue-400 hover:bg-slate-50 shadow-sm ' +
    'dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 dark:hover:border-blue-500 dark:hover:bg-slate-800',
  // Choisi par l'utilisateur et c'est la bonne réponse
  correct:
    'border-2 bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold shadow-sm ' +
    'dark:bg-emerald-950/50 dark:text-emerald-200',
  // Choisi par l'utilisateur et c'est faux
  incorrect:
    'border-2 bg-rose-50 border-rose-500 text-rose-900 font-semibold shadow-sm ' +
    'dark:bg-rose-950/50 dark:text-rose-200',
  // Bonne réponse révélée quand l'utilisateur s'est trompé
  revele:
    'border-2 bg-emerald-50/60 border-emerald-400 text-emerald-800 font-medium ' +
    'dark:bg-emerald-950/20 dark:border-emerald-500/60 dark:text-emerald-300',
  // Autres choix : atténués mais lisibles (contraste ≥ 4,5:1, pas d'opacité globale)
  grise:
    'bg-slate-50 border-slate-200 text-slate-500 cursor-default ' +
    'dark:bg-slate-900/40 dark:border-slate-800 dark:text-slate-400',
}
const STYLES_LETTRE = {
  neutre: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  correct: 'bg-emerald-500 text-white',
  incorrect: 'bg-rose-500 text-white',
  revele: 'bg-emerald-500/80 text-white',
  grise: 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500',
}

export default function AnswerChoice({
  choice,
  letter,
  isSelected = false,
  isCorrect = false,
  isAnswered = false,
  onSelect = () => {},
}) {
  let etat = 'neutre'
  let icon = null

  if (isAnswered) {
    if (isSelected && isCorrect) {
      etat = 'correct'
      icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 ml-3" aria-hidden="true" />
    } else if (isSelected) {
      etat = 'incorrect'
      icon = <XCircle className="w-5 h-5 text-rose-500 shrink-0 ml-3" aria-hidden="true" />
    } else if (isCorrect) {
      etat = 'revele'
      icon = <CheckCircle2 className="w-5 h-5 text-emerald-500/80 shrink-0 ml-3" aria-hidden="true" />
    } else {
      etat = 'grise'
    }
  }

  return (
    <motion.button
      type="button"
      onClick={() => !isAnswered && onSelect(choice.id)}
      disabled={isAnswered}
      whileHover={!isAnswered ? { scale: 1.004 } : {}}
      whileTap={!isAnswered ? { scale: 0.995 } : {}}
      className={`w-full p-4 md:p-5 rounded-2xl border text-left transition-colors duration-150 flex items-center gap-4 text-base ${STYLES[etat]}`}
    >
      {letter && (
        <span
          className={
            'w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ' + STYLES_LETTRE[etat]
          }
          aria-hidden="true"
        >
          {letter}
        </span>
      )}
      <span className="flex-1 leading-relaxed select-none" data-choice-text>
        {choice.texte}
      </span>
      {icon}
    </motion.button>
  )
}
