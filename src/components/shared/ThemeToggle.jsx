import { Sun, Moon } from 'lucide-react'
import useStatsStore from '../../store/statsStore'

/**
 * Bouton jour/nuit. `discret` : icône seule, peu contrastée, pour les en-têtes
 * où il ne doit pas concurrencer la navigation principale.
 */
export default function ThemeToggle({ className = '', discret = false }) {
  const theme = useStatsStore(s => s.theme)
  const toggleTheme = useStatsStore(s => s.toggleTheme)
  const sombre = theme === 'dark'
  const libelle = sombre ? 'Activer le mode jour' : 'Activer le mode nuit'
  const Icone = sombre ? Sun : Moon
  if (discret) return <button type="button" onClick={toggleTheme} aria-label={libelle} title={libelle}
    className={'p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors ' + className}>
    <Icone size={18} aria-hidden="true"/>
  </button>
  return <button type="button" className={'button-secondary ' + className} onClick={toggleTheme} aria-label={libelle}>
    <Icone size={16} aria-hidden="true"/>
    {sombre ? 'Mode jour' : 'Mode nuit'}
  </button>
}
