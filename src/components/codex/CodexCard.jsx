import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Copy } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import useStatsStore from '../../store/statsStore'
import { pluriel } from '../../lib/format'

/**
 * Fiche complète d'un terme du Codex.
 * Utilisée par la page Codex et par la modale ouverte pendant un QCM,
 * pour que la même fiche se lise de la même façon partout.
 */
export default function CodexCard({ entry, onSelect, afficherLienModule = true, titreId }) {
  const { lexique, modules, questions } = useStatsStore(useShallow(s => ({
    lexique: s.lexique, modules: s.modules, questions: s.questions })))
  const [copie, setCopie] = useState(false)
  useEffect(() => {
    if (!copie) return
    const t = setTimeout(() => setCopie(false), 1500)
    return () => clearTimeout(t)
  }, [copie])

  if (!entry) return <p className="muted">Cette fiche n’est pas encore disponible dans le Codex.</p>

  const module = modules.find(m => m.id === entry.module_id)
  const nbQuestions = questions.filter(q => q.termes_lexique?.includes(entry.id)).length
  const voirAussi = (entry.voir_aussi || []).map(id => lexique.find(e => e.id === id) || { id, terme: id, absent: true })
  const copier = async () => {
    try { await navigator.clipboard.writeText(entry.exemple); setCopie(true) } catch { /* presse-papiers indisponible */ }
  }

  return <article>
    <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
      {entry.categorie}
    </span>
    <h2 id={titreId} className="text-3xl font-extrabold tracking-tight mt-3">{entry.terme}</h2>
    <p className="mt-4 text-base leading-relaxed max-w-prose text-slate-800 dark:text-slate-200">{entry.definition}</p>

    <section className="mt-6 rounded-xl border-l-4 border-blue-500 bg-slate-50 dark:bg-slate-800/50 px-5 py-4 max-w-prose">
      <h3 className="font-bold mb-1">Dans un pipeline CI/CD</h3>
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{entry.role_cicd}</p>
    </section>

    {entry.exemple && <section className="mt-6">
      <div className="flex items-center justify-between gap-4 mb-2">
        <h3 className="font-bold">Exemple</h3>
        <button type="button" className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          onClick={copier}>
          {copie ? <Check size={14} aria-hidden="true"/> : <Copy size={14} aria-hidden="true"/>}
          {copie ? 'Copié' : 'Copier'}
        </button>
      </div>
      <pre className="code-block font-mono border border-slate-800">{entry.exemple}</pre>
    </section>}

    {!!voirAussi.length && <section className="mt-6">
      <h3 className="font-bold mb-2">Voir aussi</h3>
      <ul className="flex flex-wrap gap-2">
        {voirAussi.map(v => <li key={v.id}>
          <button type="button" className="button-secondary !py-1.5" disabled={v.absent} onClick={() => onSelect?.(v.id)}
            title={v.absent ? 'Fiche pas encore rédigée' : undefined}>{v.terme}</button>
        </li>)}
      </ul>
    </section>}

    <footer className="mt-8 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-x-8 gap-y-2 text-sm muted">
      {module && <p>Module : {afficherLienModule
        ? <Link className="font-semibold text-blue-600 dark:text-blue-400 hover:underline" to={'/module/' + module.id}>{module.label}</Link>
        : <span className="font-semibold">{module.label}</span>}</p>}
      <p>{nbQuestions ? 'Abordé dans ' + pluriel(nbQuestions, 'question') : 'Pas encore abordé dans les questions'}</p>
    </footer>
  </article>
}
