import { getTitre, NIVEAU_MAX, TITRES } from '../../store/statsStore'

/** Niveau, titre et progression vers le niveau suivant. */
export default function LevelCard({ niveau, xpTotal, xpNiveau, xpSuivant }) {
  const titre = getTitre(niveau)
  const prochain = TITRES.find(t => t.min > niveau)
  const pct = xpSuivant ? Math.min(100, Math.round(xpNiveau / xpSuivant * 100)) : 100
  return <section className="panel flex flex-col justify-between" aria-label="Niveau">
    <div className="flex justify-between gap-4">
      <div>
        <p className="muted text-sm">Niveau {niveau} / {NIVEAU_MAX}</p>
        <h2 className="text-2xl font-bold mt-1"><span aria-hidden="true">{titre.emoji}</span> {titre.titre}</h2>
        {prochain && <p className="muted text-sm mt-3">
          Prochain titre : <span aria-hidden="true">{prochain.emoji}</span> <span className="font-semibold">{prochain.titre}</span> au niveau {prochain.min}
        </p>}
      </div>
      <strong className="text-2xl text-blue-600 dark:text-blue-400 whitespace-nowrap" data-testid="total-xp">{xpTotal} XP</strong>
    </div>
    <div className="mt-6">
      <p className="muted text-sm mb-2">{niveau === NIVEAU_MAX ? 'Niveau maximum atteint : Légende du DevOps' : xpNiveau + ' / ' + xpSuivant + ' XP vers le niveau ' + (niveau + 1)}</p>
      <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div className="h-full rounded-full bg-soleil transition-all" style={{ width: pct + '%' }}/>
      </div>
    </div>
  </section>
}
