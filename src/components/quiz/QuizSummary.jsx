import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { RotateCcw, Target, XCircle, CheckCircle2 } from 'lucide-react'
import { titrePourNiveau } from '../../store/statsStore'
import { formaterDuree } from '../../lib/format'
import ThemeToggle from '../shared/ThemeToggle'
import Celebration from '../shared/Celebration'
import { titreBilan } from '../../lib/encouragements'

export default function QuizSummary({ summary, moduleLabel, moduleId, mistakes = [], onRestart, onReplayMistakes }) {
  if (!summary) return null
  const niveauGagne = summary.niveauAvant != null && summary.niveauApres > summary.niveauAvant
  const titre = niveauGagne ? titrePourNiveau(summary.niveauApres) : null
  const bilan = titreBilan(summary.successRate)
  // Confettis pour une session réussie (80 % et plus) ou un niveau gagné.
  const fete = niveauGagne ? 110 : summary.successRate >= 80 ? 70 : 0
  return (
    <div className="max-w-3xl mx-auto">
      {fete > 0 && <Celebration intensity={fete} />}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          className="text-blue-600 dark:text-blue-400 text-sm font-medium"
          to={moduleId ? '/module/' + moduleId : '/'}
        >
          ← Revenir au module
        </Link>
        <ThemeToggle subtle />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="panel text-center"
        data-testid="quiz-summary"
      >
        {niveauGagne && (
          <motion.div
            role="status"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.2 }}
            className="mb-6 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-200 px-5 py-4"
            data-testid="level-up"
          >
            <p className="text-3xl" aria-hidden="true">
              {titre.emoji}
            </p>
            <p className="text-lg font-bold mt-1">Niveau {summary.niveauApres} débloqué !</p>
            <p className="text-sm">Te voilà {titre.titre}. Bien mérité.</p>
          </motion.div>
        )}
        <motion.p
          className="text-5xl mb-4"
          aria-hidden="true"
          initial={{ scale: 0.4, rotate: -12 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 12 }}
        >
          {bilan.emoji}
        </motion.p>
        <h1 className="text-3xl font-bold">{bilan.titre}</h1>
        <p className="mt-3 max-w-xl mx-auto text-slate-700 dark:text-slate-300">{bilan.texte}</p>
        <p className="muted mt-2 text-sm">
          {moduleLabel} · {formaterDuree(summary.duree_secondes)}
        </p>
        <div className="grid sm:grid-cols-2 gap-4 my-8">
          <div className="panel">
            <strong className="text-3xl">
              {summary.score} / {summary.total}
            </strong>
            <p>{summary.successRate} % de réussite</p>
          </div>
          <div className="panel">
            <strong className="text-3xl text-blue-500">+{summary.xp_gagne} XP</strong>
            <p className="muted">{summary.xp_reponses} XP pour tes réponses</p>
            {!!summary.bonus_reussite && <p>Bonus belle réussite : +{summary.bonus_reussite} XP</p>}
            {!!summary.bonus_decouverte && <p>Bonus découverte : +{summary.bonus_decouverte} XP</p>}
          </div>
        </div>
        <p role="status" className="text-emerald-600 dark:text-emerald-400 mb-5">
          C’est enregistré dans ta progression.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {!!mistakes.length && (
            <button className="button-primary" onClick={onReplayMistakes}>
              <Target size={16} aria-hidden="true" />
              Retenter mes erreurs ({mistakes.length})
            </button>
          )}
          <button className={mistakes.length ? 'button-secondary' : 'button-primary'} onClick={() => onRestart()}>
            <RotateCcw size={16} aria-hidden="true" />
            Rejouer ce QCM
          </button>
          <Link className="button-secondary" to="/modules">
            Voir les modules
          </Link>
        </div>
      </motion.section>

      <section className="mt-8" aria-labelledby="titre-erreurs">
        <h2 id="titre-erreurs" className="text-xl font-bold mb-4">
          Tes erreurs, pour apprendre
        </h2>
        {!mistakes.length ? (
          <p className="panel flex items-center gap-3">
            <CheckCircle2 className="text-emerald-500 shrink-0" size={20} aria-hidden="true" />
            Aucune erreur cette fois. Tout est juste !
          </p>
        ) : (
          <ol className="space-y-4">
            {mistakes.map(({ question: q, selectedChoice }) => {
              const choisi = q.choix.find(c => c.id === selectedChoice)
              const bon = q.choix.find(c => c.id === q.reponse_correcte)
              return (
                <li key={q.id} className="panel">
                  <h3 className="font-bold leading-snug">{q.enonce}</h3>
                  <p className="mt-3 flex gap-2 text-rose-800 dark:text-rose-300">
                    <XCircle size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
                    <span>
                      <span className="font-semibold">Ta réponse :</span> {choisi?.texte}
                    </span>
                  </p>
                  <p className="mt-1 flex gap-2 text-emerald-800 dark:text-emerald-300">
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5" aria-hidden="true" />
                    <span>
                      <span className="font-semibold">Bonne réponse :</span> {bon?.texte}
                    </span>
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                    {q.explication_correcte}
                  </p>
                </li>
              )
            })}
          </ol>
        )}
      </section>
    </div>
  )
}
