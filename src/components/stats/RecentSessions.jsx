const FORMAT_DATE = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})
const MAX = 5

/** Dernières sessions terminées, de la plus récente à la plus ancienne. */
export default function RecentSessions({ sessions, modules }) {
  const recentes = [...sessions]
    .filter(s => s.date)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, MAX)
  return (
    <section className="panel" aria-labelledby="titre-sessions">
      <h2 id="titre-sessions" className="text-xl font-bold mb-4">
        Dernières sessions
      </h2>
      {!recentes.length ? (
        <p className="muted">Tes sessions terminées apparaîtront ici.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left muted">
              <th className="font-medium pb-2">Date</th>
              <th className="font-medium pb-2">Module</th>
              <th className="font-medium pb-2 text-right">Score</th>
              <th className="font-medium pb-2 text-right">XP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {recentes.map(s => (
              <tr key={s.id}>
                <td className="py-2.5 whitespace-nowrap">{FORMAT_DATE.format(new Date(s.date))}</td>
                <td className="py-2.5">{modules.find(m => m.id === s.module_id)?.label || s.module_id}</td>
                <td className="py-2.5 text-right whitespace-nowrap">
                  {s.score} / {s.total}
                </td>
                <td className="py-2.5 text-right whitespace-nowrap text-blue-600 dark:text-blue-400">
                  +{s.xp_gagne ?? 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
