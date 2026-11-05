/** Vue d'ensemble : quatre chiffres clés, sans compteur de série ni pression de régularité. */
export default function OverviewCard({ stats }) {
  const items = [
    { label: 'Questions répondues', valeur: stats.questionsRepondues + ' / ' + stats.totalQuestions },
    { label: 'Taux de réussite', valeur: stats.tentatives ? Math.round(stats.taux * 100) + ' %' : '—' },
    { label: 'Sessions terminées', valeur: stats.nbSessions },
    { label: 'Modules commencés', valeur: stats.modulesCommences + ' / ' + stats.modulesAvecQuestions },
  ]
  return <section className="panel" aria-labelledby="titre-ensemble" data-testid="overview">
    <h2 id="titre-ensemble" className="font-bold mb-4">Vue d'ensemble</h2>
    <dl className="grid grid-cols-2 gap-x-4 gap-y-5">
      {items.map(i => <div key={i.label}>
        <dt className="muted text-sm">{i.label}</dt>
        <dd className="text-xl font-bold mt-0.5">{i.valeur}</dd>
      </div>)}
    </dl>
  </section>
}
