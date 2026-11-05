// Statistiques dérivées de la progression, calculées à partir des résultats
// cumulés par question (source unique, toujours cohérente avec les sessions).

export const SEUIL_POINT_FAIBLE = 0.7
export const SEUIL_MAITRISE = 0.8

export function statutDepuisTaux(tentatives, taux) {
  if (!tentatives) return 'non-commence'
  if (taux >= SEUIL_MAITRISE) return 'maitrise'
  if (taux >= SEUIL_POINT_FAIBLE) return 'en-progres'
  return 'a-retravailler'
}

export const LIBELLES_STATUT = {
  'non-commence': 'Pas encore travaillé',
  'a-retravailler': 'À retravailler',
  'en-progres': 'En bonne voie',
  'maitrise': 'Maîtrisé',
}

function cumuler(questions, resultats) {
  return questions.reduce((acc, q) => {
    const r = resultats[q.id]
    return { tentatives: acc.tentatives + (r?.tentatives || 0), reussites: acc.reussites + (r?.reussites || 0) }
  }, { tentatives: 0, reussites: 0 })
}

export function statsSousModule(sousModuleId, questions, resultats) {
  const qs = questions.filter(q => q.sous_module_id === sousModuleId)
  const { tentatives, reussites } = cumuler(qs, resultats)
  const taux = tentatives ? reussites / tentatives : 0
  return { nbQuestions: qs.length, tentatives, reussites, taux, statut: statutDepuisTaux(tentatives, taux) }
}

export function statsModule(module, questions, resultats) {
  const qs = questions.filter(q => q.module_id === module.id)
  const { tentatives, reussites } = cumuler(qs, resultats)
  const sousModules = module.sous_modules.map(sm => ({ ...sm, stats: statsSousModule(sm.id, qs, resultats) }))
  return {
    nbQuestions: qs.length,
    tentatives,
    taux: tentatives ? reussites / tentatives : 0,
    sousModules,
    nbTravailles: sousModules.filter(sm => sm.stats.tentatives > 0).length,
    nbMaitrises: sousModules.filter(sm => sm.stats.statut === 'maitrise').length,
  }
}

const RANG_PRIORITE = { P1: 1, P2: 2, P3: 3 }

/**
 * Sous-modules travaillés dont le taux de réussite est sous le seuil (70 %),
 * du plus urgent au moins urgent : taux le plus bas, puis priorité, puis révision la plus ancienne.
 */
export function pointsFaibles(modules, questions, resultats, statsSousModules = {}) {
  const liste = []
  for (const mod of modules) {
    for (const sm of mod.sous_modules) {
      const s = statsSousModule(sm.id, questions.filter(q => q.module_id === mod.id), resultats)
      if (!s.tentatives || s.taux >= SEUIL_POINT_FAIBLE) continue
      liste.push({ module: mod, sousModule: sm, priorite: sm.priorite || mod.priorite, ...s,
        dernierPassage: statsSousModules[sm.id]?.dernier_passage || null })
    }
  }
  return liste.sort((a, b) => a.taux - b.taux ||
    RANG_PRIORITE[a.priorite] - RANG_PRIORITE[b.priorite] ||
    String(a.dernierPassage).localeCompare(String(b.dernierPassage)))
}

/** Chiffres de la vue d'ensemble du tableau de bord. */
export function statsGlobales(modules, questions, resultats, sessions = []) {
  let tentatives = 0, reussites = 0, repondues = 0
  for (const q of questions) {
    const r = resultats[q.id]
    if (r?.tentatives) { repondues++; tentatives += r.tentatives; reussites += r.reussites }
  }
  const modulesAvecQuestions = modules.filter(m => questions.some(q => q.module_id === m.id))
  const modulesCommences = new Set(sessions.map(s => s.module_id))
  return {
    questionsRepondues: repondues,
    totalQuestions: questions.length,
    taux: tentatives ? reussites / tentatives : 0,
    tentatives,
    nbSessions: sessions.length,
    modulesAvecQuestions: modulesAvecQuestions.length,
    modulesCommences: modulesAvecQuestions.filter(m => modulesCommences.has(m.id)).length,
    modulesNonCommences: modulesAvecQuestions.filter(m => !modulesCommences.has(m.id)),
  }
}
