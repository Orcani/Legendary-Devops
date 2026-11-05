import { Link, NavLink } from 'react-router-dom'
import { BookOpen, House, LayoutGrid } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const ONGLETS = [
  { to: '/', label: 'Accueil', icone: House, end: true },
  { to: '/modules', label: 'Modules', icone: LayoutGrid },
  { to: '/codex', label: 'Codex', icone: BookOpen },
]

/**
 * En-tête des trois écrans principaux : marque, navigation par onglets, titre de la page.
 * Le bouton de thème est discret et séparé de la navigation (priorité différente).
 */
export default function AppHeader({ titre, sousTitre }) {
  return <header className="mb-8">
    <div className="flex items-center justify-between gap-4">
      <Link to="/" className="text-lg font-extrabold tracking-tight">Legendary DevOps</Link>
      <ThemeToggle discret/>
    </div>
    <nav aria-label="Navigation principale" className="mt-3 flex gap-1 border-b border-slate-200 dark:border-slate-800">
      {ONGLETS.map(({ to, label, icone: Icone, end }) => <NavLink key={to} to={to} end={end}
        className={({ isActive }) => 'inline-flex items-center gap-2 px-4 py-2.5 -mb-px border-b-2 text-sm font-semibold transition-colors ' +
          (isActive ? 'border-blue-600 text-blue-700 dark:border-blue-400 dark:text-blue-300'
            : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300 dark:text-slate-400 dark:hover:text-white dark:hover:border-slate-600')}>
        <Icone size={16} aria-hidden="true"/>{label}
      </NavLink>)}
    </nav>
    <h1 className="text-3xl font-extrabold mt-8">{titre}</h1>
    {sousTitre && <p className="muted mt-1 max-w-prose">{sousTitre}</p>}
  </header>
}
