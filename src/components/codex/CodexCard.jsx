import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Copy, Lightbulb } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import useStatsStore from '../../store/statsStore'
import { pluriel } from '../../lib/format'

/**
 * Fiche complète d'un terme du Codex.
 * Utilisée par la page Codex et par la modale ouverte pendant un QCM,
 * pour que la même fiche se lise de la même façon partout.
 */
export default function CodexCard({ entry, onSelect, showModuleLink = true, titleId }) {
  const { lexique, modules, questions } = useStatsStore(
    useShallow(s => ({
      lexique: s.lexique,
      modules: s.modules,
      questions: s.questions,
    })),
  )
  const [copie, setCopie] = useState(false)
  useEffect(() => {
    if (!copie) return
    const t = setTimeout(() => setCopie(false), 1500)
    return () => clearTimeout(t)
  }, [copie])

  if (!entry) return <p className="muted">Cette fiche n’est pas encore écrite.</p>

  const module = modules.find(m => m.id === entry.module_id)
  const nbQuestions = questions.filter(q => q.termes_lexique?.includes(entry.id)).length
  const voirAussi = (entry.voir_aussi || []).map(
    id => lexique.find(e => e.id === id) || { id, terme: id, absent: true },
  )
  const copier = async () => {
    try {
      await navigator.clipboard.writeText(entry.exemple)
      setCopie(true)
    } catch {
      /* presse-papiers indisponible */
    }
  }

  return (
    <article>
      <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
        {entry.categorie}
      </span>
      <h2 id={titleId} className="text-3xl font-extrabold tracking-tight mt-3">
        {entry.terme}
      </h2>

      {/* En bref : la phrase à retenir, en langage courant */}
      <p
        className="mt-4 text-xl font-semibold leading-relaxed max-w-prose text-encre dark:text-slate-100"
        data-testid="codex-en-bref"
      >
        {entry.en_bref || entry.definition}
      </p>

      {entry.analogie && (
        <section className="mt-5 flex gap-3 rounded-2xl bg-soleil-clair px-5 py-4 text-encre max-w-prose">
          <Lightbulb size={20} className="shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <h3 className="text-sm font-bold">Pour te le représenter</h3>
            <p className="mt-1 leading-relaxed">{entry.analogie}</p>
          </div>
        </section>
      )}

      <dl className="mt-6 space-y-5 max-w-prose">
        {entry.en_bref && (
          <div>
            <dt className="text-sm font-bold uppercase tracking-wide muted">Plus précisément</dt>
            <dd className="mt-1 leading-relaxed text-slate-700 dark:text-slate-300">{entry.definition}</dd>
          </div>
        )}
        <div>
          <dt className="text-sm font-bold uppercase tracking-wide muted">À quoi ça sert en DevOps</dt>
          <dd className="mt-1 leading-relaxed text-slate-700 dark:text-slate-300">{entry.role_cicd}</dd>
        </div>
      </dl>

      {entry.exemple && (
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950">
          <div className="flex items-center justify-between gap-4 border-b border-slate-800 px-4 py-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Exemple</h3>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-800"
              onClick={copier}
            >
              {copie ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
              {copie ? 'Copié' : 'Copier'}
            </button>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap px-4 py-3 font-mono text-sm text-emerald-300">
            {entry.exemple}
          </pre>
        </section>
      )}

      {!!voirAussi.length && (
        <section className="mt-6">
          <h3 className="font-bold mb-2">Ça va avec</h3>
          <ul className="flex flex-wrap gap-2">
            {voirAussi.map(v => (
              <li key={v.id}>
                <button
                  type="button"
                  className="button-secondary !py-1.5"
                  disabled={v.absent}
                  onClick={() => onSelect?.(v.id)}
                  title={v.absent ? 'Fiche pas encore écrite' : undefined}
                >
                  {v.terme}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      <footer className="mt-8 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-x-8 gap-y-2 text-sm muted">
        {module && (
          <p>
            Module :{' '}
            {showModuleLink ? (
              <Link
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                to={'/module/' + module.id}
              >
                {module.label}
              </Link>
            ) : (
              <span className="font-semibold">{module.label}</span>
            )}
          </p>
        )}
        <p>
          {nbQuestions
            ? 'On en parle dans ' + pluriel(nbQuestions, 'question')
            : 'Pas encore utilisé dans les questions'}
        </p>
      </footer>
    </article>
  )
}
