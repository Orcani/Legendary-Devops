import { useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import useStatsStore from '../store/statsStore'
import AppHeader from '../components/shared/AppHeader'
import CodexModal from '../components/codex/CodexModal'
import { normaliser, pluriel } from '../lib/format'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
const lettreDe = terme => {
  const l = normaliser(terme)[0]?.toUpperCase()
  return l && ALPHABET.includes(l) ? l : '#'
}

/**
 * Codex : cartes groupées par lettre, avec un index alphabétique pour s'y repérer.
 * Un clic ouvre la fiche complète en modale ; la fiche ouverte est dans l'URL (/codex?terme=<id>).
 */
export default function CodexView() {
  const lexique = useStatsStore(s => s.lexique)
  const [params, setParams] = useSearchParams()
  const [recherche, setRecherche] = useState('')
  const [categorie, setCategorie] = useState('Toutes')
  const champ = useRef(null)

  const tries = useMemo(
    () => [...lexique].sort((a, b) => a.terme.localeCompare(b.terme, 'fr', { sensitivity: 'base' })),
    [lexique],
  )
  const categories = useMemo(() => {
    const compte = new Map()
    for (const e of lexique) compte.set(e.categorie, (compte.get(e.categorie) || 0) + 1)
    return [...compte].sort((a, b) => a[0].localeCompare(b[0], 'fr'))
  }, [lexique])

  const q = normaliser(recherche.trim())
  const filtres = tries.filter(
    e =>
      (categorie === 'Toutes' || e.categorie === categorie) &&
      (!q || [e.terme, e.definition, e.role_cicd, e.exemple || ''].some(v => normaliser(v).includes(q))),
  )
  const groupes = filtres.reduce((acc, e) => {
    const lettre = lettreDe(e.terme)
    const dernier = acc[acc.length - 1]
    if (dernier?.lettre === lettre) dernier.termes.push(e)
    else acc.push({ lettre, termes: [e] })
    return acc
  }, [])
  const lettresPresentes = new Set(groupes.map(g => g.lettre))

  const ouvert = params.get('terme')
  const ouvrir = id => setParams({ terme: id })
  const fermer = () => setParams({}, { replace: true })
  const effacer = () => {
    setRecherche('')
    setCategorie('Toutes')
    champ.current?.focus()
  }
  // Défile dans la zone de la page (et non toute la fenêtre), sous l'index qui reste collé en haut.
  const allerA = lettre => {
    const cible = document.getElementById('lettre-' + lettre)
    const zone = cible?.closest('.page')
    if (!cible || !zone) return
    const calme = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const index = document.getElementById('index-alphabetique')?.offsetHeight || 0
    const haut = cible.getBoundingClientRect().top - zone.getBoundingClientRect().top + zone.scrollTop - index - 16
    zone.scrollTo({ top: haut, behavior: calme ? 'auto' : 'smooth' })
  }

  return (
    <main className="page">
      <div className="max-w-6xl mx-auto">
        <AppHeader
          title="Codex"
          subtitle="Le petit dictionnaire du DevOps. Ouvre une carte pour lire la fiche en entier."
        />

        {/* Recherche et filtres */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="relative md:w-96">
            <label htmlFor="codex-search" className="sr-only">
              Rechercher un terme
            </label>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="codex-search"
              ref={champ}
              type="text"
              className="field !py-2.5 !pl-9 !pr-9"
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              placeholder="Rechercher un terme ou une notion"
              autoComplete="off"
            />
            {recherche && (
              <button
                type="button"
                onClick={() => {
                  setRecherche('')
                  champ.current?.focus()
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                aria-label="Effacer la recherche"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filtrer par catégorie">
            {[['Toutes', lexique.length], ...categories].map(([c, n]) => (
              <button
                key={c}
                type="button"
                aria-pressed={categorie === c}
                onClick={() => setCategorie(c)}
                className="chip"
              >
                {c} <span className="opacity-60">{n}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Index alphabétique : reste visible en haut pendant le défilement */}
        <nav
          id="index-alphabetique"
          aria-label="Index alphabétique"
          className="sticky -top-6 md:-top-8 z-10 -mx-2 px-2 py-3 mt-4 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-800"
        >
          {[...ALPHABET, '#']
            .filter(l => l !== '#' || lettresPresentes.has('#'))
            .map(l => {
              const present = lettresPresentes.has(l)
              return (
                <button
                  key={l}
                  type="button"
                  disabled={!present}
                  onClick={() => allerA(l)}
                  aria-label={present ? 'Aller à la lettre ' + l : 'Aucun terme en ' + l}
                  className={
                    'w-8 h-8 rounded-lg text-sm font-bold transition-colors ' +
                    (present
                      ? 'text-blue-700 hover:bg-soleil-clair dark:text-blue-300 dark:hover:bg-blue-900'
                      : 'text-slate-300 dark:text-slate-700 cursor-default')
                  }
                >
                  {l}
                </button>
              )
            })}
        </nav>

        <p className="text-sm muted mt-4 mb-2" role="status">
          {filtres.length === lexique.length
            ? pluriel(lexique.length, 'terme')
            : pluriel(filtres.length, 'résultat') + ' sur ' + lexique.length}
        </p>

        {!filtres.length ? (
          <div className="panel text-center py-10 mt-4">
            <p>
              Aucun terme ne correspond{recherche ? <> à « {recherche} »</> : null}
              {categorie !== 'Toutes' ? ' dans ' + categorie : ''}.
            </p>
            <button type="button" className="button-secondary mt-4" onClick={effacer}>
              Effacer les filtres
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Une ligne par lettre : la lettre dans la marge de gauche, ses cartes à droite */}
            {groupes.map(g => (
              <section
                key={g.lettre}
                id={'lettre-' + g.lettre}
                aria-labelledby={'titre-lettre-' + g.lettre}
                className="grid grid-cols-[3rem_1fr] gap-4"
              >
                <h2 id={'titre-lettre-' + g.lettre} className="sticky top-14 self-start">
                  <span
                    className="w-12 h-12 rounded-xl bg-soleil text-encre text-2xl font-extrabold flex items-center justify-center"
                    aria-hidden="true"
                  >
                    {g.lettre}
                  </span>
                  <span className="sr-only">
                    Lettre {g.lettre}, {pluriel(g.termes.length, 'terme')}
                  </span>
                </h2>
                <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {g.termes.map(e => (
                    <li key={e.id}>
                      <button
                        type="button"
                        onClick={() => ouvrir(e.id)}
                        data-codex-item={e.id}
                        className="panel w-full h-full text-left flex flex-col hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
                      >
                        <span className="self-start text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {e.categorie}
                        </span>
                        <span className="block text-lg font-bold mt-3">{e.terme}</span>
                        <span className="block text-sm leading-relaxed mt-2 line-clamp-3 text-slate-700 dark:text-slate-300">
                          {e.en_bref || e.definition}
                        </span>
                        {e.exemple && (
                          <code className="block mt-4 truncate rounded-lg px-3 py-2 text-xs font-mono bg-slate-950 text-emerald-300 border border-slate-800">
                            {e.exemple.split('\n')[0]}
                          </code>
                        )}
                        <span className="block mt-auto pt-4 text-sm font-semibold text-blue-600 dark:text-blue-400">
                          Ouvrir la fiche
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
      {ouvert && <CodexModal key={ouvert} termId={ouvert} onClose={fermer} closeLabel="Fermer" showModuleLink />}
    </main>
  )
}
