// Brouillons de session (QCM en cours) conservés dans localStorage.
export const PREFIXE_BROUILLON = 'devops-quiz-draft:'
const DUREE_MAX_MS = 30 * 24 * 3600 * 1000

// Supprime les brouillons illisibles, trop anciens (30 jours) ou dont une
// question n'existe plus dans dataApp.json.
export function purgerBrouillons(questions, maintenant = Date.now()) {
  const ids = new Set(questions.map(q => q.id))
  try {
    const cles = Object.keys(localStorage).filter(k => k.startsWith(PREFIXE_BROUILLON))
    for (const cle of cles) {
      let valide = false
      try {
        const b = JSON.parse(localStorage.getItem(cle))
        valide =
          Array.isArray(b?.ids) &&
          b.ids.length > 0 &&
          b.ids.every(id => ids.has(id)) &&
          maintenant - (Number(b.startedAt) || 0) < DUREE_MAX_MS
      } catch {
        /* brouillon illisible : supprimé */
      }
      if (!valide) localStorage.removeItem(cle)
    }
  } catch {
    /* localStorage indisponible : rien à purger */
  }
}

/**
 * Sessions commencées (au moins une réponse) et pas encore terminées, la plus récente d'abord.
 * La clé du brouillon encode « module:sous-module:portée:mode » (voir useQuiz).
 */
export function brouillonsEnCours(stockage = globalThis.localStorage) {
  const liste = []
  try {
    for (const cle of Object.keys(stockage).filter(k => k.startsWith(PREFIXE_BROUILLON))) {
      try {
        const b = JSON.parse(stockage.getItem(cle))
        const repondues = Object.keys(b?.answers || {}).length
        if (!repondues || b.finishing) continue
        const [moduleId, sousModuleId, portee, mode] = cle.slice(PREFIXE_BROUILLON.length).split(':')
        liste.push({
          moduleId,
          sousModuleId: sousModuleId || null,
          portee: portee || 'all',
          mode: mode || 'long',
          repondues,
          total: b.ids?.length || 0,
          debut: Number(b.startedAt) || 0,
        })
      } catch {
        /* brouillon illisible : ignoré */
      }
    }
  } catch {
    /* stockage indisponible */
  }
  return liste.sort((a, b) => b.debut - a.debut)
}

/** Adresse du QCM correspondant à un brouillon (`reprendre=1` évite de redemander la reprise). */
export function lienBrouillon(b) {
  return (
    '/quiz/' +
    b.moduleId +
    '?mode=' +
    b.mode +
    '&scope=' +
    b.portee +
    (b.sousModuleId ? '&submodule=' + b.sousModuleId : '') +
    '&reprendre=1'
  )
}
