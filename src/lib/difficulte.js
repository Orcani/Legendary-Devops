/**
 * Difficulté adaptative des QCM (D-40).
 * Le palier d'un module dépend du niveau général et du travail fait sur ce module :
 * nombre de sessions terminées et taux de réussite. Le palier ne change que la proportion
 * de questions faciles / moyennes / difficiles : aucune question n'est jamais interdite.
 */
export const DIFFICULTES = ['debutant', 'intermediaire', 'avance']

export const LIBELLES_PALIER = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
}

// Poids de tirage par palier : [débutant, intermédiaire, avancé].
export const POIDS_PAR_PALIER = {
  debutant: { debutant: 6, intermediaire: 3, avance: 1 },
  intermediaire: { debutant: 2, intermediaire: 5, avance: 3 },
  avance: { debutant: 1, intermediaire: 3, avance: 6 },
}

/**
 * @param {{ niveau: number, sessionsModule: number, tauxModule: number|null }} p
 *   tauxModule : réussite cumulée sur le module (0 à 1), null si aucune réponse.
 */
export function palierDifficulte({ niveau = 1, sessionsModule = 0, tauxModule = null }) {
  const taux = tauxModule ?? 0
  if ((sessionsModule >= 4 && taux >= 0.8) || (niveau >= 15 && sessionsModule >= 1 && taux >= 0.7)) return 'avance'
  if ((sessionsModule >= 2 && taux >= 0.6) || (niveau >= 6 && (tauxModule === null || taux >= 0.5)))
    return 'intermediaire'
  return 'debutant'
}

/** Palier d'un module à partir de l'état du store. */
export function palierModule({ moduleId, niveau, sessions, questions, resultats }) {
  const sessionsModule = sessions.filter(s => s.module_id === moduleId).length
  let tentatives = 0
  let reussites = 0
  for (const q of questions) {
    if (q.module_id !== moduleId) continue
    tentatives += resultats[q.id]?.tentatives || 0
    reussites += resultats[q.id]?.reussites || 0
  }
  return palierDifficulte({ niveau, sessionsModule, tauxModule: tentatives ? reussites / tentatives : null })
}

/**
 * Tirage pondéré sans remise (méthode d'Efraimidis et Spirakis), puis tri du plus facile au plus difficile :
 * la session commence en douceur. L'ordre reste aléatoire à l'intérieur d'une même difficulté.
 */
/**
 * Priorité selon l'historique (D-50) : jamais vue ×3, ratée la dernière fois ×2,5, fragile (< 50 %) ×2,
 * bien maîtrisée (au moins 2 réussites, ≥ 80 %, dernière réponse juste) ×0,3. Ainsi une session
 * fait surtout réfléchir sur du nouveau ou du fragile, et ne ressert pas toujours les mêmes questions.
 */
export function prioriteHistorique(r) {
  if (!r || !r.tentatives) return 3
  if (r.derniere === false) return 2.5
  const taux = r.reussites / r.tentatives
  if (taux < 0.5) return 2
  if (r.reussites >= 2 && taux >= 0.8 && r.derniere !== false) return 0.3
  return 1
}

export function tirerQuestionsAdaptees(pool, limit, palier = 'debutant', random = Math.random, resultats = {}) {
  const poids = POIDS_PAR_PALIER[palier] || POIDS_PAR_PALIER.debutant
  const rang = q => Math.max(0, DIFFICULTES.indexOf(q.difficulte))
  const tirees = pool
    .map(q => ({
      q,
      cle: Math.pow(
        random() || Number.MIN_VALUE,
        1 / ((poids[q.difficulte] || 1) * prioriteHistorique(resultats[q.id])),
      ),
      hasard: random(),
    }))
    .sort((a, b) => b.cle - a.cle)
    .slice(0, limit || pool.length)
  return tirees.sort((a, b) => rang(a.q) - rang(b.q) || a.hasard - b.hasard).map(t => t.q)
}
