import { useEffect, useRef } from 'react'

/**
 * Fenêtre de confirmation accessible (focus piégé, Échap pour annuler).
 * Le bouton d'annulation reçoit le focus : une validation par réflexe ne déclenche rien.
 */
export default function ConfirmDialog({
  title,
  children,
  confirmLabel,
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
  busy = false,
}) {
  const dialog = useRef(null)
  const annuler = useRef(null)
  useEffect(() => {
    const avant = document.activeElement
    annuler.current?.focus()
    const touche = e => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Tab') {
        const noeuds = [...dialog.current.querySelectorAll('button:not([disabled])')]
        const premier = noeuds[0]
        const dernier = noeuds[noeuds.length - 1]
        if (e.shiftKey && document.activeElement === premier) {
          e.preventDefault()
          dernier.focus()
        } else if (!e.shiftKey && document.activeElement === dernier) {
          e.preventDefault()
          premier.focus()
        }
      }
    }
    document.addEventListener('keydown', touche)
    return () => {
      document.removeEventListener('keydown', touche)
      avant?.focus()
    }
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-5"
      onClick={e => {
        if (e.target === e.currentTarget) onCancel()
      }}
    >
      <section
        ref={dialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="panel w-full max-w-md shadow-2xl"
        data-testid="confirm-dialog"
      >
        <h2 id="confirm-title" className="text-xl font-bold">
          {title}
        </h2>
        <div className="mt-3 text-slate-700 dark:text-slate-300 leading-relaxed">{children}</div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button ref={annuler} type="button" className="button-secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel}
          </button>
          <button type="button" className="button-primary" onClick={onConfirm} disabled={busy} data-testid="confirm-ok">
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  )
}
