import { useEffect, useRef, useState } from 'react'
import { X, ArrowLeft } from 'lucide-react'
import useStatsStore from '../../store/statsStore'
import CodexCard from './CodexCard'

/**
 * Fiche Codex en modale : depuis la page Codex, ou pendant un QCM sans quitter la session.
 * Les « Voir aussi » s'enchaînent dans la modale, avec un retour à la fiche précédente.
 */
export default function CodexModal({ termId, onClose, libelleFermer = 'Reprendre le QCM', afficherLienModule = false }) {
  const lexique = useStatsStore(s => s.lexique)
  const [historique, setHistorique] = useState([termId])
  const activeId = historique[historique.length - 1]
  const precedent = lexique.find(e => e.id === historique[historique.length - 2])
  const entry = lexique.find(item => item.id === activeId)
  const dialog = useRef(null)
  useEffect(() => {
    const previous = document.activeElement
    dialog.current?.focus()
    const handleKey = e => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Tab') {
        const nodes = [...dialog.current.querySelectorAll('button:not([disabled]), [href], input, [tabindex="0"]')]
        if (!nodes.length) { e.preventDefault(); return }
        const first = nodes[0], last = nodes[nodes.length - 1]
        if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) {
          e.preventDefault(); last.focus()
        } else if (!e.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) {
          e.preventDefault(); first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => { document.removeEventListener('keydown', handleKey); previous?.focus() }
  }, [onClose])
  useEffect(() => { dialog.current?.scrollTo?.({ top: 0 }) }, [activeId])

  return <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5"
    onClick={e => { if (e.target === e.currentTarget) onClose() }}>
    <section ref={dialog} role="dialog" aria-modal="true" aria-labelledby="codex-title" tabIndex={-1}
      className="panel w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl focus:outline-none">
      <div className="flex justify-between items-center gap-4 mb-4">
        {precedent ? <button type="button" className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          onClick={() => setHistorique(h => h.slice(0, -1))}>
          <ArrowLeft size={16} aria-hidden="true"/>Retour à {precedent.terme}
        </button> : <p className="text-sm muted">Codex</p>}
        <button className="button-secondary !px-2.5" aria-label="Fermer la fiche" onClick={onClose}><X size={18}/></button>
      </div>
      {entry ? <CodexCard entry={entry} titreId="codex-title" afficherLienModule={afficherLienModule}
        onSelect={id => setHistorique(h => [...h, id])}/> :
        <p id="codex-title">Cette fiche n’est pas encore disponible dans le Codex.</p>}
      <button className="button-primary mt-6" onClick={onClose}>{libelleFermer}</button>
    </section>
  </div>
}
