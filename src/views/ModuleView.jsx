import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { Check, ExternalLink, Shuffle, ListChecks } from 'lucide-react'
import useStatsStore from '../store/statsStore'
import { questionPool } from '../lib/quizSelection'
import { classePriorite } from '../lib/priorites'
import { statsModule, LIBELLES_STATUT } from '../lib/stats'
import { pluriel, estimerMinutes, LIBELLES_PRIORITE } from '../lib/format'
import ModuleIcon from '../components/shared/ModuleIcon'
import ThemeToggle from '../components/shared/ThemeToggle'

const TAILLE_REVISION_RAPIDE = 10

// Pastille du parcours : couleur selon l'état du sous-module.
const STYLES_ETAPE = {
  'non-commence': 'border-2 border-slate-300 text-slate-500 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400',
  'a-retravailler': 'bg-amber-500 text-white',
  'en-progres': 'bg-blue-600 text-white',
  'maitrise': 'bg-emerald-600 text-white',
}
const STYLES_BARRE = {
  'non-commence': 'bg-slate-300 dark:bg-slate-700',
  'a-retravailler': 'bg-amber-500',
  'en-progres': 'bg-blue-600',
  'maitrise': 'bg-emerald-600',
}
const STYLES_STATUT = {
  'non-commence': 'text-slate-500 dark:text-slate-400',
  'a-retravailler': 'text-amber-700 dark:text-amber-400',
  'en-progres': 'text-blue-700 dark:text-blue-400',
  'maitrise': 'text-emerald-700 dark:text-emerald-400',
}
const RANG_PRIORITE = { P1: 1, P2: 2, P3: 3 }

export default function ModuleView() {
  const { moduleId } = useParams()
  const { modules, questions, resultats } = useStatsStore(useShallow(s => ({
    modules: s.modules, questions: s.questions, resultats: s.resultats_par_question })))
  const [scope, setScope] = useState('all')
  const mod = modules.find(m => m.id === moduleId)
  if (!mod) return <main className="page"><h1 className="text-2xl font-bold">Module introuvable</h1>
    <Link className="button-primary mt-4" to="/modules">Retour aux modules</Link></main>

  const stats = statsModule(mod, questions, resultats)
  const poolTout = questionPool({ questions, modules, resultats, moduleId, scope: 'all' })
  const poolVus = questionPool({ questions, modules, resultats, moduleId, scope: 'seen' })
  const scopeEffectif = scope === 'seen' && poolVus.length ? 'seen' : 'all'
  const pool = scopeEffectif === 'seen' ? poolVus : poolTout
  const lien = mode => '/quiz/' + moduleId + '?mode=' + mode + '&scope=' + scopeEffectif
  // Ordre du parcours : priorité d'abord, puis ordre du cours.
  const etapes = stats.sousModules
    .map((sm, i) => ({ ...sm, priorite: sm.priorite || mod.priorite, ordre: i }))
    .sort((a, b) => RANG_PRIORITE[a.priorite] - RANG_PRIORITE[b.priorite] || a.ordre - b.ordre)
  const prioritesMixtes = new Set(etapes.map(e => e.priorite)).size > 1

  return <main className="page">
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link className="text-blue-600 dark:text-blue-400 text-sm font-medium" to="/modules">← Modules</Link>
        <ThemeToggle discret/>
      </div>

      {/* En-tête du module : identité visuelle portée par la couleur du module */}
      <header className="panel relative overflow-hidden mb-8">
        <span className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: mod.couleur }} aria-hidden="true"/>
        <div className="flex flex-col md:flex-row md:items-start gap-5 pt-2">
          <ModuleIcon icon={mod.icon} couleur={mod.couleur} taille="lg"/>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className={classePriorite(mod.priorite)}>{mod.priorite}</span>
              <span className="muted text-sm">{LIBELLES_PRIORITE[mod.priorite]}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">{mod.label}</h1>
            <p className="mt-3 text-base leading-relaxed max-w-prose text-slate-700 dark:text-slate-300">
              {mod.resume || mod.description}
            </p>
            {!!mod.concepts_cles?.length && <ul className="flex flex-wrap gap-2 mt-4" aria-label="Notions clés">
              {mod.concepts_cles.map(c => <li key={c}
                className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{c}</li>)}
            </ul>}
          </div>
        </div>
        <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
          <div><dt className="muted text-sm">Sous-modules</dt><dd className="text-2xl font-bold">{mod.sous_modules.length}</dd></div>
          <div><dt className="muted text-sm">Questions</dt><dd className="text-2xl font-bold">{stats.nbQuestions}</dd></div>
          <div><dt className="muted text-sm">Maîtrisés</dt><dd className="text-2xl font-bold">{stats.nbMaitrises} / {mod.sous_modules.length}</dd></div>
          <div><dt className="muted text-sm">Réussite</dt>
            <dd className="text-2xl font-bold">{stats.tentatives ? Math.round(stats.taux * 100) + ' %' : '—'}</dd></div>
        </dl>
        {mod.lien_cours && <a href={mod.lien_cours} target="_blank" rel="noreferrer"
          className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          Ouvrir le cours de Stéphane Robert <ExternalLink size={14} aria-hidden="true"/>
        </a>}
      </header>

      <div className="grid lg:grid-cols-5 gap-8 items-start">
        {/* Révision du module entier */}
        <section className="panel lg:col-span-2 lg:order-2 lg:sticky lg:top-0" aria-labelledby="titre-revision">
          <h2 id="titre-revision" className="text-xl font-bold">Réviser tout le module</h2>
          <p className="muted text-sm mt-1 mb-5">Des questions de tous les sous-modules, mélangées.</p>

          <p className="text-sm font-semibold mb-2" id="label-scope">Questions tirées de</p>
          <div className="segmented mb-5" role="group" aria-labelledby="label-scope">
            <button type="button" aria-pressed={scopeEffectif === 'all'} onClick={() => setScope('all')}>
              Tout le module
            </button>
            <button type="button" aria-pressed={scopeEffectif === 'seen'} onClick={() => setScope('seen')}
              disabled={!poolVus.length} data-testid="scope-seen"
              title={poolVus.length ? undefined : 'Disponible après une première session terminée'}>
              Déjà travaillés
            </button>
          </div>

          {!pool.length ? <p role="status" className="muted">Les questions de ce module arrivent bientôt.</p> :
            <div className="space-y-3">
              {pool.length > TAILLE_REVISION_RAPIDE && <Link to={lien('short')} className="tile tile-primary">
                <Shuffle size={22} aria-hidden="true" className="shrink-0"/>
                <span className="flex-1">
                  <span className="block font-bold text-base">Révision rapide</span>
                  <span className="block text-sm opacity-90">{TAILLE_REVISION_RAPIDE} questions au hasard, environ {estimerMinutes(TAILLE_REVISION_RAPIDE)} min</span>
                </span>
              </Link>}
              <Link to={lien('long')} className={'tile ' + (pool.length > TAILLE_REVISION_RAPIDE ? 'tile-secondary' : 'tile-primary')}>
                <ListChecks size={22} aria-hidden="true" className="shrink-0"/>
                <span className="flex-1">
                  <span className="block font-bold text-base">Toutes les questions</span>
                  <span className="block text-sm opacity-90">
                    {pool.length > 1 ? 'Les ' + pool.length + ' questions' : 'La question'} de la sélection, environ {estimerMinutes(pool.length)} min
                  </span>
                </span>
              </Link>
              {pool.length <= TAILLE_REVISION_RAPIDE && <p className="muted text-xs">
                La révision rapide apparaîtra quand la sélection dépassera {TAILLE_REVISION_RAPIDE} questions.
              </p>}
            </div>}
        </section>

        {/* Parcours des sous-modules */}
        <section className="lg:col-span-3 lg:order-1" aria-labelledby="titre-parcours">
          <h2 id="titre-parcours" className="text-xl font-bold mb-1">Parcours du module</h2>
          <p className="muted text-sm mb-6">Chaque étape se révise séparément pour cibler vos points faibles.</p>
          <ol className="relative">
            {etapes.map((sm, i) => {
              const s = sm.stats
              const derniere = i === etapes.length - 1
              return <li key={sm.id} className="relative flex gap-4 pb-6">
                {!derniere && <span className="absolute left-5 top-11 bottom-0 w-px bg-slate-300 dark:bg-slate-700" aria-hidden="true"/>}
                <span className={'relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ' + STYLES_ETAPE[s.statut]}
                  aria-hidden="true">
                  {s.statut === 'maitrise' ? <Check size={18} strokeWidth={3}/> : i + 1}
                </span>
                <article className="panel flex-1 min-w-0 !p-5">
                  <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                    <h3 className="text-lg font-bold">{sm.label}</h3>
                    {prioritesMixtes && <span className={classePriorite(sm.priorite)}>{sm.priorite}</span>}
                  </div>
                  {sm.resume && <p className="text-sm leading-relaxed mt-2 max-w-prose text-slate-700 dark:text-slate-300">{sm.resume}</p>}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex-1 min-w-[12rem]">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className={'font-semibold ' + STYLES_STATUT[s.statut]}>{LIBELLES_STATUT[s.statut]}</span>
                        <span className="muted">
                          {s.nbQuestions ? pluriel(s.nbQuestions, 'question') : 'Aucune question'}
                          {s.tentatives ? ', ' + Math.round(s.taux * 100) + ' % de réussite' : ''}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div className={'h-full rounded-full ' + STYLES_BARRE[s.statut]}
                          style={{ width: (s.tentatives ? Math.max(4, Math.round(s.taux * 100)) : 0) + '%' }}/>
                      </div>
                    </div>
                    {s.nbQuestions ? <Link className="button-secondary" to={'/quiz/' + moduleId + '?submodule=' + sm.id + '&mode=long'}
                      data-testid={'reviser-' + sm.id}>
                      Réviser cette étape
                    </Link> : <span className="text-sm muted italic">Questions à venir</span>}
                  </div>
                </article>
              </li>
            })}
          </ol>
        </section>
      </div>
    </div>
  </main>
}
