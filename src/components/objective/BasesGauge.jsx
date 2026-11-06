/**
 * Jauge en demi-cercle pour « Tes bases ». Jaune soleil = progression (D-32) ; jamais de rouge.
 * Le pourcentage est aussi écrit en clair pour les lecteurs d'écran.
 */
export default function BasesGauge({ value }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)
  const longueur = Math.PI * 50
  return (
    <div className="relative w-48 mx-auto" role="img" aria-label={`Bases acquises à ${pct} %`}>
      <svg viewBox="0 0 120 68" className="w-full" aria-hidden="true">
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          strokeWidth="12"
          strokeLinecap="round"
          className="stroke-slate-200 dark:stroke-slate-800"
        />
        {pct > 0 && (
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            strokeWidth="12"
            strokeLinecap="round"
            className="stroke-soleil transition-all duration-700"
            strokeDasharray={`${(pct / 100) * longueur} ${longueur}`}
          />
        )}
      </svg>
      <p className="absolute inset-x-0 bottom-0 text-center text-3xl font-extrabold" data-testid="jauge-bases">
        {pct} %
      </p>
    </div>
  )
}
