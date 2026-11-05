import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, BookOpen } from 'lucide-react'
import useStatsStore from '../../store/statsStore'

/**
 * Encart de correction et d'explications après réponse.
 * - Vert si bonne réponse ("Excellente réponse !")
 * - Rouge si mauvaise réponse ("Oups, ce n'est pas ça.")
 * - Boutons ouvrant la fiche Codex en modale (sans quitter le QCM), libellés avec le nom du terme
 * Le thème est géré par les variantes `dark:` de Tailwind.
 */
export default function FeedbackPanel({
  isCorrect = false,
  explicationCorrecte = '',
  explicationErreur = '',
  termesCodex = [],
  onOpenCodex = () => {},
}) {
  const lexique = useStatsStore(s => s.lexique)
  const nomDuTerme = id => lexique.find(e => e.id === id)?.terme || id
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      role="status"
      className={`mt-6 p-5 md:p-6 rounded-2xl border ${
        isCorrect
          ? 'bg-emerald-50 border-emerald-200 text-emerald-950 dark:bg-emerald-950/50 dark:border-emerald-500/40 dark:text-emerald-100'
          : 'bg-rose-50 border-rose-200 text-rose-950 dark:bg-rose-950/50 dark:border-rose-500/40 dark:text-rose-100'
      }`}
    >
      {/* En-tête avec titre et icône */}
      <div className="flex items-center gap-2.5 font-bold text-base mb-2">
        {isCorrect ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" aria-hidden="true" />
            <span className="text-emerald-900 dark:text-emerald-300">Excellente réponse !</span>
          </>
        ) : (
          <>
            <XCircle className="w-5 h-5 text-rose-500 shrink-0" aria-hidden="true" />
            <span className="text-rose-900 dark:text-rose-300">Oups, ce n'est pas ça.</span>
          </>
        )}
      </div>

      {/* Texte explicatif */}
      <p className="text-sm leading-relaxed pl-7 text-slate-700 dark:text-slate-300">
        {isCorrect ? explicationCorrecte : explicationErreur}
      </p>

      {/* Liens vers le Codex : ouvre la modale sans quitter le QCM */}
      {termesCodex.length > 0 && (
        <div className="mt-4 pt-3 border-t pl-7 flex items-center gap-2 flex-wrap border-slate-200/80 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" aria-hidden="true" />
            Fiches Codex :
          </span>
          {termesCodex.map((terme) => (
            <button
              key={terme}
              type="button"
              data-codex-id={terme}
              onClick={() => onOpenCodex(terme)}
              className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-semibold shadow-sm transition active:scale-95 bg-white hover:bg-slate-50 text-blue-600 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-blue-300 dark:border-slate-700"
            >
              {nomDuTerme(terme)}
            </button>
          ))}
        </div>
      )}
    </motion.div>
  )
}
