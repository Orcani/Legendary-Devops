// Page « Mon objectif » (D-52) : où tu en es par rapport à ce que demandent les offres de stage.
// Tout est calculé à partir de tes réponses ; aucune comparaison avec d'autres personnes (pas de données).

/** Une étape compte comme acquise à partir de 70 % de ses questions réussies. */
export const SEUIL_ETAPE = 0.7
/** Repères de la barre « Quand postuler ? » (moyenne des étapes indispensables). */
export const REPERES = [
  { seuil: 0.4, id: 'bases', libelle: 'Bases posées' },
  { seuil: 0.7, id: 'prete', libelle: 'Tu peux postuler' },
  { seuil: 0.9, id: 'solide', libelle: 'Profil solide' },
]
/** Sous ce niveau, une étape indispensable bloque le repère « Tu peux postuler », même si la moyenne l'atteint. */
export const PLANCHER_INDISPENSABLE = 0.4

/**
 * Une question est acquise si ta dernière réponse était juste.
 * Pour l'ancien historique (sans « derniere »), on se fie au taux : au moins une réussite sur deux.
 */
export function questionAcquise(r) {
  if (!r || !r.tentatives) return false
  if (r.derniere !== undefined) return r.derniere === true
  return r.reussites / r.tentatives >= 0.5
}

/** Part des questions acquises dans une étape (0 à 1). */
export function maitriseEtape(sousModuleId, questions, resultats) {
  const qs = questions.filter(q => q.sous_module_id === sousModuleId)
  if (!qs.length) return { acquises: 0, total: 0, ratio: 0, commencee: false }
  const acquises = qs.filter(q => questionAcquise(resultats[q.id])).length
  const commencee = qs.some(q => resultats[q.id]?.tentatives)
  return { acquises, total: qs.length, ratio: acquises / qs.length, commencee }
}

function index(modules) {
  const parId = new Map()
  for (const m of modules) for (const sm of m.sous_modules) parId.set(sm.id, { sousModule: sm, module: m })
  return parId
}

function detailler(ids, parId, questions, resultats) {
  return ids.filter(id => parId.has(id)).map(id => ({ ...parId.get(id), ...maitriseEtape(id, questions, resultats) }))
}

const moyenne = liste => (liste.length ? liste.reduce((s, e) => s + e.ratio, 0) / liste.length : 0)

/** Jauge « Tes bases » : le socle que toutes les offres supposent, et les bases encore à consolider. */
export function evaluerSocle(socle, modules, questions, resultats) {
  const etapes = detailler(socle, index(modules), questions, resultats)
  const score = moyenne(etapes)
  const aConsolider = etapes.filter(e => e.ratio < SEUIL_ETAPE).sort((a, b) => a.ratio - b.ratio)
  return {
    score,
    etapes,
    aConsolider,
    solide: score >= SEUIL_ETAPE && !aConsolider.some(e => e.ratio < PLANCHER_INDISPENSABLE),
  }
}

/**
 * Où tu en es pour un poste : moyenne des étapes indispensables (barre), repère atteint,
 * et liste des étapes à travailler, de la plus urgente à la moins urgente.
 */
export function evaluerPoste(poste, modules, questions, resultats) {
  const parId = index(modules)
  const indispensables = detailler(poste.indispensable, parId, questions, resultats)
  const apprecies = detailler(poste.apprecie, parId, questions, resultats)
  const score = moyenne(indispensables)
  const bloquantes = indispensables.filter(e => e.ratio < PLANCHER_INDISPENSABLE)
  let repere = null
  for (const r of REPERES) {
    if (score < r.seuil) break
    if (r.id !== 'bases' && bloquantes.length) break
    repere = r
  }
  const aTravailler = [
    ...indispensables
      .filter(e => e.ratio < SEUIL_ETAPE)
      .sort((a, b) => a.ratio - b.ratio)
      .map(e => ({ ...e, indispensable: true })),
    ...apprecies
      .filter(e => e.ratio < SEUIL_ETAPE)
      .sort((a, b) => a.ratio - b.ratio)
      .map(e => ({ ...e, indispensable: false })),
  ]
  return {
    score,
    repere,
    prete: repere?.id === 'prete' || repere?.id === 'solide',
    bloquantes,
    indispensables,
    apprecies,
    aTravailler,
    nbAcquises: indispensables.filter(e => e.ratio >= SEUIL_ETAPE).length,
  }
}

/** Prochain repère à viser (null quand « Profil solide » est atteint). */
export function prochainRepere(evaluation) {
  const rang = evaluation.repere ? REPERES.indexOf(evaluation.repere) : -1
  return REPERES[rang + 1] || null
}
