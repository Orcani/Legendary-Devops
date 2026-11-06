import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Info, Sparkles } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import useStatsStore from '../store/statsStore'
import { evaluerPoste, evaluerSocle, prochainRepere, SEUIL_ETAPE } from '../lib/objectif'
import { lienComprendre, lienEntrainement } from '../lib/parcours'
import { pluriel } from '../lib/format'
import AppHeader from '../components/shared/AppHeader'
import BasesGauge from '../components/objective/BasesGauge'
import ReadinessBar from '../components/objective/ReadinessBar'

const CLE_POSTE = 'devops-quiz-objectif-poste'
const NB_A_TRAVAILLER = 4

function lirePoste(postes) {
  try {
    const id = localStorage.getItem(CLE_POSTE)
    if (postes.some(p => p.id === id)) return id
  } catch {
    /* stockage indisponible */
  }
  return postes[0]?.id
}

const pct = v => Math.round(v * 100) + ' %'

/** Lien d'action vers une étape : la découvrir si sa leçon n'a pas été lue, sinon s'y entraîner. */
function lienEtape(e, comprendreVus) {
  const lire = e.sousModule.comprendre && !comprendreVus.includes(e.sousModule.id)
  return lire
    ? { to: lienComprendre(e.module.id, e.sousModule.id), libelle: 'Découvrir cette étape' }
    : { to: lienEntrainement(e.module.id, e.sousModule.id), libelle: "M'entraîner" }
}

function MiniBarre({ value }) {
  return (
    <div className="h-1.5 w-24 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden" aria-hidden="true">
      <div className="h-full rounded-full bg-soleil" style={{ width: Math.round(value * 100) + '%' }} />
    </div>
  )
}

function messagePoste(ev, suivant) {
  if (ev.repere?.id === 'solide')
    return 'Ton profil couvre très bien ce que demandent les offres. Fonce, et garde le rythme qui te convient.'
  if (ev.prete)
    return 'Tu as ce que la plupart des offres demandent : tu peux commencer à postuler. Les étapes restantes se travaillent en parallèle.'
  if (ev.score >= 0.7 && ev.bloquantes.length)
    return `Ta moyenne est au niveau, il reste juste ${pluriel(ev.bloquantes.length, 'étape indispensable', 'étapes indispensables')} à poser avant de postuler.`
  if (ev.repere?.id === 'bases')
    return `Les bases du poste sont posées. Prochain repère : « ${suivant.libelle} », à ${pct(suivant.seuil)}.`
  return `Chaque étape travaillée te rapproche du premier repère : « ${suivant.libelle} », à ${pct(suivant.seuil)}.`
}

/** Mon objectif : jauge des bases, avancée vers un poste visé et étapes à travailler pour l'atteindre. */
export default function ObjectiveView() {
  const s = useStatsStore(
    useShallow(st => ({
      modules: st.modules,
      questions: st.questions,
      resultats: st.resultats_par_question,
      objectifs: st.objectifs,
      comprendreVus: st.comprendre_vus,
    })),
  )
  const postes = s.objectifs?.postes || []
  const [posteId, setPosteId] = useState(() => lirePoste(postes))
  const [detail, setDetail] = useState(false)
  const poste = postes.find(p => p.id === posteId) || postes[0]

  if (!poste)
    return (
      <main className="page">
        <div className="max-w-6xl mx-auto">
          <AppHeader title="Mon objectif" />
          <p className="panel">Aucun poste n'est encore décrit dans le contenu de l'application.</p>
        </div>
      </main>
    )

  const choisir = id => {
    setPosteId(id)
    try {
      localStorage.setItem(CLE_POSTE, id)
    } catch {
      /* stockage indisponible */
    }
  }
  const socle = evaluerSocle(s.objectifs.socle, s.modules, s.questions, s.resultats)
  const ev = evaluerPoste(poste, s.modules, s.questions, s.resultats)
  const suivant = prochainRepere(ev)
  const aTravailler = ev.aTravailler.slice(0, NB_A_TRAVAILLER)
  const basesFaibles = socle.aConsolider.slice(0, 3)

  return (
    <main className="page">
      <div className="max-w-6xl mx-auto">
        <AppHeader
          title="Mon objectif"
          subtitle="Choisis le poste que tu vises : tu vois où tu en es et ce qui te rapproche le plus de ce que demandent les offres."
        />

        <section aria-label="Poste visé" className="mb-5">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Choisir un poste">
            {postes.map(p => (
              <button
                key={p.id}
                type="button"
                className="chip text-sm px-4 py-1.5"
                aria-pressed={p.id === poste.id}
                onClick={() => choisir(p.id)}
              >
                {p.intitule}
              </button>
            ))}
          </div>
          <p className="muted mt-3 max-w-prose">{poste.resume}</p>
        </section>

        <div className="grid lg:grid-cols-3 lg:items-start gap-5">
          <section className="panel" aria-labelledby="titre-bases">
            <h2 id="titre-bases" className="text-lg font-bold">
              Tes bases
            </h2>
            <p className="muted text-sm mt-1">Ce que toutes les offres supposent acquis.</p>
            <div className="mt-5">
              <BasesGauge value={socle.score} />
            </div>
            {socle.solide ? (
              <p className="mt-4 text-sm font-semibold text-center">
                Tes bases sont solides : place à la spécialisation.
              </p>
            ) : (
              <div className="mt-4 text-sm">
                <p className="font-semibold">Encore un peu de bases avant de te spécialiser :</p>
                <ul className="mt-2 space-y-1.5">
                  {basesFaibles.map(e => (
                    <li key={e.sousModule.id} className="flex items-center justify-between gap-3">
                      <Link
                        className="text-blue-700 dark:text-blue-300 hover:underline"
                        to={lienEtape(e, s.comprendreVus).to}
                      >
                        {e.sousModule.label}
                      </Link>
                      <span className="muted whitespace-nowrap">{pct(e.ratio)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="panel lg:col-span-2" aria-labelledby="titre-postuler">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="titre-postuler" className="text-lg font-bold">
                  Quand postuler ?
                </h2>
                <p className="muted text-sm mt-1">
                  {pluriel(ev.nbAcquises, 'étape indispensable', 'étapes indispensables')} acquise
                  {ev.nbAcquises > 1 ? 's' : ''} sur {ev.indispensables.length}
                </p>
              </div>
              <strong className="text-3xl font-extrabold whitespace-nowrap" data-testid="score-poste">
                {pct(ev.score)}
              </strong>
            </div>
            <div className="mt-6">
              <ReadinessBar value={ev.score} reached={ev.repere} />
            </div>
            <p
              className={
                'mt-2 text-sm rounded-xl p-3 flex gap-2 ' +
                (ev.prete
                  ? 'bg-soleil-clair text-encre dark:bg-soleil/15 dark:text-soleil-clair'
                  : 'bg-slate-100 dark:bg-slate-800/60')
              }
            >
              {ev.prete && <Sparkles size={18} className="shrink-0 mt-0.5" aria-hidden="true" />}
              <span>{messagePoste(ev, suivant)}</span>
            </p>
          </section>
        </div>

        <section className="panel mt-5" aria-labelledby="titre-travailler">
          <h2 id="titre-travailler" className="text-lg font-bold">
            Ce qui te rapproche le plus de ce poste
          </h2>
          {aTravailler.length === 0 ? (
            <p className="muted mt-2">Toutes les étapes de ce poste sont acquises. Bravo !</p>
          ) : (
            <ol className="mt-4 divide-y divide-slate-200 dark:divide-slate-800">
              {aTravailler.map((e, i) => {
                const lien = lienEtape(e, s.comprendreVus)
                return (
                  <li key={e.sousModule.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{e.sousModule.label}</p>
                      <p className="muted text-sm">
                        {e.module.label} · {e.indispensable ? 'indispensable' : 'apprécié'} · {e.acquises}/{e.total}{' '}
                        questions acquises
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <MiniBarre value={e.ratio} />
                      <Link className={i === 0 ? 'button-primary py-2' : 'button-secondary'} to={lien.to}>
                        {lien.libelle}
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
          {ev.aTravailler.length > NB_A_TRAVAILLER && (
            <p className="muted text-sm mt-2">
              Et {pluriel(ev.aTravailler.length - NB_A_TRAVAILLER, 'autre étape', 'autres étapes')} ensuite, dans le
              détail ci-dessous.
            </p>
          )}
        </section>

        <section className="panel mt-5" aria-labelledby="titre-detail">
          <div className="flex items-center justify-between gap-4">
            <h2 id="titre-detail" className="text-lg font-bold">
              Ce que demandent les offres
            </h2>
            <button
              type="button"
              className="button-secondary"
              aria-expanded={detail}
              onClick={() => setDetail(d => !d)}
            >
              {detail ? 'Masquer le détail' : 'Voir le détail'}
            </button>
          </div>
          {detail && (
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              {[
                ['Indispensable', ev.indispensables],
                ['Apprécié', ev.apprecies],
              ].map(([titre, liste]) => (
                <div key={titre}>
                  <h3 className="font-semibold mb-2">{titre}</h3>
                  <ul className="space-y-2 text-sm">
                    {liste.map(e => (
                      <li key={e.sousModule.id} className="flex items-center justify-between gap-3">
                        <span className={e.ratio >= SEUIL_ETAPE ? 'font-semibold' : ''}>
                          {e.ratio >= SEUIL_ETAPE ? '✓ ' : ''}
                          {e.sousModule.label}
                        </span>
                        <span className="flex items-center gap-2">
                          <MiniBarre value={e.ratio} />
                          <span className="muted w-10 text-right">{pct(e.ratio)}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="mt-6 flex gap-2 text-sm muted max-w-prose">
          <Info size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            Ces repères viennent d'offres de stage et d'alternance DevOps, CI/CD, cloud et SRE. Une étape compte comme
            acquise quand tu réussis au moins 70 % de ses questions (ta dernière réponse fait foi). Tu ne verras pas de
            « top 40 % des candidat·es » : l'application ne connaît pas les autres personnes, un tel chiffre serait
            inventé.
          </p>
        </aside>
      </div>
    </main>
  )
}
