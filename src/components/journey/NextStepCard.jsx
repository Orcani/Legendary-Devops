import { Link } from 'react-router-dom'
import { BookOpenCheck, History, ListChecks, SearchCheck, Sparkles, TrendingUp } from 'lucide-react'

const ICONES = {
  reprendre: History,
  reviser: SearchCheck,
  comprendre: BookOpenCheck,
  entrainer: ListChecks,
  consolider: TrendingUp,
  termine: Sparkles,
}

/** La prochaine étape conseillée : une seule action, mise en avant en haut de Mon parcours. */
export default function NextStepCard({ step }) {
  const Icone = ICONES[step.type] || Sparkles
  return (
    <section
      className="panel relative overflow-hidden flex flex-wrap items-center gap-5"
      aria-labelledby="titre-prochaine-etape"
      data-testid="next-step"
    >
      <span className="absolute inset-y-0 left-0 w-1.5 bg-soleil" aria-hidden="true" />
      <span
        className="w-12 h-12 shrink-0 rounded-2xl bg-soleil-clair text-encre flex items-center justify-center"
        aria-hidden="true"
      >
        <Icone size={24} />
      </span>
      <div className="flex-1 min-w-[14rem]">
        <p className="muted text-sm">Prochaine étape conseillée</p>
        <h2 id="titre-prochaine-etape" className="text-xl font-bold mt-0.5">
          {step.titre}
        </h2>
        {step.detail && <p className="muted text-sm mt-1">{step.detail}</p>}
      </div>
      <Link className="button-primary" to={step.lien}>
        {step.libelle}
      </Link>
    </section>
  )
}
