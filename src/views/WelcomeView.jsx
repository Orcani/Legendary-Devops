import { Link } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { BookOpen, BookOpenCheck, LayoutGrid, ListChecks, Route, SearchCheck } from 'lucide-react'
import useStatsStore from '../store/statsStore'
import { prochaineEtape } from '../lib/parcours'
import ThemeToggle from '../components/shared/ThemeToggle'

const ETAPES = [
  {
    icone: BookOpenCheck,
    titre: 'Comprendre',
    texte: 'Tu lis une courte leçon : les idées clés, un exemple concret et l’essentiel à retenir.',
  },
  {
    icone: ListChecks,
    titre: 'S’entraîner',
    texte: 'Tu réponds à un QCM. Chaque réponse est corrigée et expliquée tout de suite.',
  },
  {
    icone: SearchCheck,
    titre: 'Revoir',
    texte: 'Tu reviens sur tes erreurs. Les étapes encore fragiles t’attendent dans Mon parcours.',
  },
]

/** Premier lancement (ou à la demande) : comment fonctionne l'application et par où commencer. */
export default function WelcomeView() {
  const { modules, questions, resultats, comprendreVus, markIntroSeen } = useStatsStore(
    useShallow(s => ({
      modules: s.modules,
      questions: s.questions,
      resultats: s.resultats_par_question,
      comprendreVus: s.comprendre_vus,
      markIntroSeen: s.markIntroSeen,
    })),
  )
  const premiere = prochaineEtape({ modules, questions, resultats, comprendreVus })

  return (
    <main className="page" data-testid="welcome">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2.5 text-lg font-extrabold tracking-tight">
            <img src={import.meta.env.BASE_URL + 'icon.svg'} alt="" width="32" height="32" className="w-8 h-8" />
            Legendary DevOps
          </span>
          <ThemeToggle subtle />
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mt-12">Par où commencer ?</h1>
        <p className="mt-3 text-lg leading-relaxed max-w-prose text-slate-700 dark:text-slate-300">
          Ici, tu apprends les bases du DevOps à ton rythme, sans chrono et sans pression. Chaque étape se fait en trois
          temps.
        </p>

        <ol className="grid md:grid-cols-3 gap-4 mt-8">
          {ETAPES.map(({ icone: Icone, titre, texte }, i) => (
            <li key={titre} className="panel">
              <div className="flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <Icone size={18} />
                </span>
                <h2 className="font-bold">
                  {i + 1}. {titre}
                </h2>
              </div>
              <p className="muted text-sm mt-3 leading-relaxed">{texte}</p>
            </li>
          ))}
        </ol>

        <h2 className="text-xl font-bold mt-12">Par quoi tu veux commencer ?</h2>
        <div className="mt-4 space-y-3">
          <Link to={premiere.lien} onClick={markIntroSeen} className="tile tile-primary">
            <Route size={22} aria-hidden="true" className="shrink-0" />
            <span className="flex-1">
              <span className="block font-bold text-base">Commencer par les bases</span>
              <span className="block text-sm opacity-90">
                On te guide étape par étape. Première étape : {premiere.titre}
              </span>
            </span>
          </Link>
          <Link to="/modules" onClick={markIntroSeen} className="tile tile-secondary">
            <LayoutGrid size={22} aria-hidden="true" className="shrink-0" />
            <span className="flex-1">
              <span className="block font-bold text-base">Choisir moi-même un sujet</span>
              <span className="block text-sm muted">Tous les modules, du plus important au plus avancé</span>
            </span>
          </Link>
          <Link to="/codex" onClick={markIntroSeen} className="tile tile-secondary">
            <BookOpen size={22} aria-hidden="true" className="shrink-0" />
            <span className="flex-1">
              <span className="block font-bold text-base">Feuilleter le Codex</span>
              <span className="block text-sm muted">Le petit dictionnaire du DevOps, expliqué simplement</span>
            </span>
          </Link>
        </div>

        <p className="mt-8 text-sm">
          <Link className="text-blue-600 dark:text-blue-400 hover:underline" to="/" onClick={markIntroSeen}>
            Voir Mon parcours
          </Link>
        </p>
      </div>
    </main>
  )
}
