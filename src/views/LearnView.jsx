import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  Clock,
  Copy,
  Flag,
  Lightbulb,
  ListChecks,
  Sparkles,
  Target,
} from 'lucide-react'
import useStatsStore from '../store/statsStore'
import { etapesOrdonnees, lienComprendre, lienEntrainement } from '../lib/parcours'
import { pluriel } from '../lib/format'
import ModuleIcon from '../components/shared/ModuleIcon'
import ThemeToggle from '../components/shared/ThemeToggle'
import CodexModal from '../components/codex/CodexModal'
import Celebration from '../components/shared/Celebration'
import { MAX_SESSION_ETAPE } from '../lib/selection'

// « Lire un chemin » → « lire un chemin », pour enchaîner après « tu vas apprendre à ».
const minusculeInitiale = t => (t ? t.charAt(0).toLocaleLowerCase('fr') + t.slice(1) : t)

/**
 * Étape « Comprendre » d'un sous-module : objectifs, notions clés reliées au Codex,
 * schéma facultatif, exemple et « à retenir », puis passage au QCM.
 */
export default function LearnView() {
  const { moduleId, sousModuleId } = useParams()
  const { modules, questions, resultats, lexique, markUnderstood } = useStatsStore(
    useShallow(s => ({
      modules: s.modules,
      questions: s.questions,
      resultats: s.resultats_par_question,
      lexique: s.lexique,
      markUnderstood: s.markUnderstood,
    })),
  )
  const [codexTerm, setCodexTerm] = useState(null)
  const [copied, setCopied] = useState(false)
  const closeCodex = useCallback(() => setCodexTerm(null), [])
  const [lecture, setLecture] = useState(0)
  const [finAtteinte, setFinAtteinte] = useState(false)
  const finLecture = useRef(null)
  const suivreLecture = e => {
    const el = e.currentTarget
    const max = el.scrollHeight - el.clientHeight
    setLecture(max > 0 ? Math.min(100, Math.round((el.scrollTop / max) * 100)) : 100)
  }

  const mod = modules.find(m => m.id === moduleId)
  const etapes = mod ? etapesOrdonnees([mod], questions, resultats) : []
  const index = etapes.findIndex(e => e.sousModule.id === sousModuleId)
  const etape = etapes[index]
  const precedente = index > 0 ? etapes[index - 1] : null
  const suivante = etapes[index + 1]
  // Une étape voisine s'ouvre sur sa page « Comprendre », ou sur la page du module si elle n'en a pas.
  const lienEtape = e => (e.sousModule.comprendre ? lienComprendre(mod.id, e.sousModule.id) : '/module/' + mod.id)
  const contenu = etape?.sousModule.comprendre

  // Ouvrir l'étape suffit à la marquer comme lue (repère pour la prochaine étape conseillée).
  useEffect(() => {
    if (contenu) markUnderstood(sousModuleId)
  }, [contenu, sousModuleId, markUnderstood])

  // Arrivée en bas de la leçon : un bravo (une seule fois par lecture).
  useEffect(() => {
    const cible = finLecture.current
    if (!cible || finAtteinte || typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setFinAtteinte(true)
      },
      { threshold: 0.6 },
    )
    obs.observe(cible)
    return () => obs.disconnect()
  }, [finAtteinte])

  useEffect(() => {
    if (!copied) return
    const t = setTimeout(() => setCopied(false), 1500)
    return () => clearTimeout(t)
  }, [copied])

  if (!etape) {
    return (
      <main className="page">
        <h1 className="text-2xl font-bold">Cette étape n’existe pas</h1>
        <Link className="button-primary mt-4" to={mod ? '/module/' + mod.id : '/modules'}>
          Revenir au module
        </Link>
      </main>
    )
  }

  const { sousModule: sm, stats } = etape
  const nomDuTerme = id => lexique.find(e => e.id === id)?.terme || id
  const copier = async () => {
    try {
      await navigator.clipboard.writeText(contenu.exemple.code)
      setCopied(true)
    } catch {
      /* presse-papiers indisponible */
    }
  }

  const motsLecture = contenu
    ? [contenu.objectifs?.join(' '), ...contenu.notions.map(n => n.titre + ' ' + n.texte), contenu.a_retenir]
        .join(' ')
        .split(/\s+/).length
    : 0
  const minutes = Math.max(1, Math.round(motsLecture / 180))

  return (
    <main className="page !pt-0" onScroll={suivreLecture}>
      {/* Barre de lecture : avance avec le défilement, en jaune « progression » */}
      <div className="sticky top-0 z-20 -mx-6 md:-mx-8 h-1.5 bg-slate-200/70 dark:bg-slate-800" aria-hidden="true">
        <div className="h-full bg-soleil transition-[width] duration-150" style={{ width: lecture + '%' }} />
      </div>
      <div className="max-w-3xl mx-auto pt-6 md:pt-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link className="text-blue-600 dark:text-blue-400 text-sm font-medium" to={'/module/' + mod.id}>
            ← {mod.label}
          </Link>
          <ThemeToggle subtle />
        </div>

        {/* En-tête de la leçon */}
        <header className="panel relative overflow-hidden" data-testid="learn">
          <span
            className="absolute inset-x-0 top-0 h-1.5"
            style={{ backgroundColor: mod.couleur }}
            aria-hidden="true"
          />
          <div className="flex items-start gap-4 pt-1">
            <ModuleIcon icon={mod.icon} color={mod.couleur} />
            <div className="min-w-0">
              <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                Leçon · étape {etape.numero} sur {etapes.length}
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight mt-1">{sm.label}</h1>
              {sm.resume && <p className="mt-3 leading-relaxed text-slate-700 dark:text-slate-300">{sm.resume}</p>}
            </div>
          </div>
          {contenu && (
            <ul className="flex flex-wrap gap-2 mt-5 text-sm" aria-label="En bref">
              <li className="inline-flex items-center gap-1.5 rounded-full bg-brume px-3 py-1 text-encre dark:bg-slate-800 dark:text-slate-200">
                <Clock size={14} aria-hidden="true" />
                {minutes} min de lecture
              </li>
              <li className="inline-flex items-center gap-1.5 rounded-full bg-brume px-3 py-1 text-encre dark:bg-slate-800 dark:text-slate-200">
                <Lightbulb size={14} aria-hidden="true" />
                {pluriel(contenu.notions.length, 'idée clé', 'idées clés')}
              </li>
              {!!stats.nbQuestions && (
                <li className="inline-flex items-center gap-1.5 rounded-full bg-brume px-3 py-1 text-encre dark:bg-slate-800 dark:text-slate-200">
                  <ListChecks size={14} aria-hidden="true" />
                  {pluriel(Math.min(MAX_SESSION_ETAPE, stats.nbQuestions), 'question')} pour te tester
                </li>
              )}
            </ul>
          )}
        </header>

        {!contenu ? (
          <section className="panel mt-8">
            <p>La leçon de cette étape n’est pas encore écrite.</p>
          </section>
        ) : (
          <>
            {/* Objectifs */}
            {!!contenu.objectifs?.length && (
              <section className="mt-8" aria-labelledby="titre-objectifs">
                <h2 id="titre-objectifs" className="flex items-center gap-2 text-lg font-bold">
                  <Flag size={20} className="text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  Dans cette leçon, tu vas apprendre à
                </h2>
                <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                  {contenu.objectifs.map(o => (
                    <li
                      key={o}
                      className="flex gap-2.5 rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <Target
                        size={18}
                        className="mt-0.5 shrink-0 text-soleil-fonce dark:text-soleil"
                        aria-hidden="true"
                      />
                      <span className="text-sm leading-relaxed">{minusculeInitiale(o)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Idées clés : une frise verticale, une idée par jalon */}
            <section className="mt-10" aria-labelledby="titre-notions">
              <h2 id="titre-notions" className="text-xl font-bold">
                Les idées clés
              </h2>
              <ol className="mt-5">
                {contenu.notions.map((n, i) => (
                  <li key={n.titre} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < contenu.notions.length - 1 && (
                      <span
                        className="absolute left-[1.0625rem] top-10 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800"
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className="relative z-10 w-9 h-9 shrink-0 rounded-full bg-soleil text-encre flex items-center justify-center font-extrabold"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <div className="panel flex-1 min-w-0 !py-4">
                      <h3 className="text-lg font-bold leading-snug">{n.titre}</h3>
                      <p className="mt-2 leading-relaxed text-slate-700 dark:text-slate-300">{n.texte}</p>
                      {/* Une même fiche Codex n'est proposée qu'une fois par page. */}
                      {n.codex && contenu.notions.findIndex(autre => autre.codex === n.codex) === i && (
                        <button
                          type="button"
                          onClick={() => setCodexTerm(n.codex)}
                          className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900"
                        >
                          <BookOpen size={14} aria-hidden="true" />
                          La fiche « {nomDuTerme(n.codex)} »
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Schéma : les étapes dans des cases reliées */}
            {contenu.schema?.etapes?.length > 1 && (
              <section
                className="mt-10 rounded-2xl bg-brume px-5 py-5 dark:bg-slate-900 dark:border dark:border-slate-800"
                aria-labelledby="titre-schema"
              >
                <h2 id="titre-schema" className="font-bold text-encre dark:text-slate-100">
                  {contenu.schema.titre || 'En un coup d’œil'}
                </h2>
                <ol className="mt-4 flex flex-wrap items-center gap-2">
                  {contenu.schema.etapes.map((etapeSchema, i) => (
                    <li key={etapeSchema} className="flex items-center gap-2">
                      <span className="rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold shadow-sm text-encre dark:bg-slate-800 dark:text-slate-100">
                        <span className="mr-1.5 text-xs font-bold text-blue-600 dark:text-blue-300">{i + 1}</span>
                        {etapeSchema}
                      </span>
                      {i < contenu.schema.etapes.length - 1 && (
                        <ArrowRight
                          size={18}
                          className="text-soleil-fonce dark:text-soleil shrink-0"
                          aria-hidden="true"
                        />
                      )}
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {/* Exemple, présenté comme un terminal */}
            {contenu.exemple?.code && (
              <section className="mt-10" aria-labelledby="titre-exemple">
                <h2 id="titre-exemple" className="text-xl font-bold">
                  En pratique
                </h2>
                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-lg">
                  <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-2.5">
                    <span className="flex gap-1.5" aria-hidden="true">
                      <span className="w-3 h-3 rounded-full bg-rose-400/80" />
                      <span className="w-3 h-3 rounded-full bg-soleil" />
                      <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                    </span>
                    <p className="flex-1 truncate text-xs text-slate-400">{contenu.exemple.legende}</p>
                    <button
                      type="button"
                      onClick={copier}
                      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                    >
                      {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                      {copied ? 'Copié' : 'Copier'}
                    </button>
                  </div>
                  <pre className="overflow-x-auto whitespace-pre-wrap px-4 py-4 font-mono text-sm leading-relaxed text-emerald-300">
                    {contenu.exemple.code}
                  </pre>
                </div>
              </section>
            )}

            {/* À retenir */}
            {contenu.a_retenir && (
              <section
                className="mt-10 rounded-2xl border-2 border-soleil bg-soleil-clair px-6 py-5 text-encre"
                aria-labelledby="titre-retenir"
              >
                <h2 id="titre-retenir" className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                  <Sparkles size={18} aria-hidden="true" />
                  Si tu ne retiens qu’une chose
                </h2>
                <p className="mt-2 text-lg font-semibold leading-relaxed">{contenu.a_retenir}</p>
              </section>
            )}
          </>
        )}

        {/* Fin de la leçon : un bravo, puis le QCM */}
        <footer ref={finLecture} className="mt-10 panel text-center" data-testid="learn-end">
          {contenu && finAtteinte && <Celebration intensity={35} />}
          {contenu && (
            <>
              <p className="text-4xl" aria-hidden="true">
                {finAtteinte ? '🎉' : '📖'}
              </p>
              <h2 className="mt-2 text-xl font-bold">
                {finAtteinte ? 'Leçon terminée, bravo !' : 'Tu arrives au bout de la leçon'}
              </h2>
              <p className="muted mt-1">
                {stats.nbQuestions
                  ? 'Le meilleur moment pour te tester, c’est maintenant, tant que c’est frais.'
                  : 'Les questions de cette étape arrivent bientôt.'}
              </p>
            </>
          )}
          {!!stats.nbQuestions && (
            <Link className="button-primary mt-5" to={lienEntrainement(mod.id, sm.id)} data-testid="learn-practice">
              <ListChecks size={16} aria-hidden="true" />
              Me tester sur cette étape ({pluriel(Math.min(MAX_SESSION_ETAPE, stats.nbQuestions), 'question')})
            </Link>
          )}
        </footer>
        {(precedente || suivante) && (
          <nav className="mt-6 mb-4 flex flex-wrap items-center justify-between gap-3" aria-label="Étapes du module">
            {precedente ? (
              <Link className="button-secondary" to={lienEtape(precedente)} data-testid="learn-previous">
                <ArrowLeft size={16} aria-hidden="true" />
                {precedente.sousModule.label}
              </Link>
            ) : (
              <span />
            )}
            {suivante && (
              <Link className="button-secondary" to={lienEtape(suivante)} data-testid="learn-next">
                {suivante.sousModule.label}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
          </nav>
        )}
      </div>
      {codexTerm && (
        <CodexModal key={codexTerm} termId={codexTerm} onClose={closeCodex} closeLabel="Revenir à la leçon" />
      )}
    </main>
  )
}
