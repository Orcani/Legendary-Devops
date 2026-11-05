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
        valide = Array.isArray(b?.ids) && b.ids.length > 0 && b.ids.every(id => ids.has(id)) &&
          maintenant - (Number(b.startedAt) || 0) < DUREE_MAX_MS
      } catch { /* brouillon illisible : supprimé */ }
      if (!valide) localStorage.removeItem(cle)
    }
  } catch { /* localStorage indisponible : rien à purger */ }
}
