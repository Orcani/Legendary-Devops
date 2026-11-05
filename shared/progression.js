export const NIVEAU_MAX = 50
export const xpRequis = niveau => Math.round(100 * niveau ** 1.8)
export function calculerNiveauDepuisXP(xpTotal) {
  let niveau = 1, cumule = 0
  while (niveau < NIVEAU_MAX && cumule + xpRequis(niveau) <= xpTotal) {
    cumule += xpRequis(niveau++)
  }
  const xpActuel = xpTotal - cumule
  const xpSuivant = niveau < NIVEAU_MAX ? xpRequis(niveau) : 0
  return { niveau, xpActuel, xpSuivant, pourcentage: xpSuivant ? Math.min(100, Math.round(xpActuel / xpSuivant * 100)) : 100 }
}
export function normaliserProgression(prog = {}) {
  const xp = Math.max(0, Number(prog.xp_total) || 0)
  const n = calculerNiveauDepuisXP(xp)
  return { sessions: [], resultats_par_question: {}, stats_par_sous_module: {}, ...prog,
    xp_total: xp, niveau: n.niveau, xp_niveau_actuel: n.xpActuel, xp_pour_niveau_suivant: n.xpSuivant }
}
// Une session est identifiée avant son premier envoi : un nouvel envoi ne double jamais les gains.
export function enregistrerSession(previous, session, questions, date = new Date().toISOString()) {
  const prog = normaliserProgression(previous)
  if (!session?.id || typeof session.id !== 'string') throw new Error('Identifiant de session manquant.')
  const existing = prog.sessions.find(s => s.id === session.id)
  if (existing) return { progression: prog, session: existing }
  const answers = session.answers
  if (!Array.isArray(answers) || !answers.length || new Set(answers.map(a => a.questionId)).size !== answers.length) {
    throw new Error('Réponses de session invalides.')
  }
  const resultats = structuredClone(prog.resultats_par_question)
  let score = 0, xpReponses = 0
  for (const answer of answers) {
    const q = questions.find(q => q.id === answer.questionId && q.module_id === session.module_id)
    if (!q || !q.choix.some(c => c.id === answer.selectedChoice)) throw new Error('Question ou réponse inconnue.')
    const old = resultats[q.id] || { tentatives: 0, reussites: 0 }
    const correct = answer.selectedChoice === q.reponse_correcte
    if (correct) { score++; xpReponses += old.tentatives > 0 ? 5 : 10 }
    resultats[q.id] = { tentatives: old.tentatives + 1, reussites: old.reussites + Number(correct) }
  }
  const successRate = Math.round(score / answers.length * 100)
  const bonusReussite = score === answers.length ? 50 : score / answers.length >= 0.8 ? 20 : 0
  const bonusDecouverte = prog.sessions.some(s => s.module_id === session.module_id) ? 0 : 30
  const saved = { id: session.id, date, module_id: session.module_id, score, total: answers.length,
    duree_secondes: Math.max(1, Math.round(Number(session.duree_secondes) || 1)),
    xp_gagne: xpReponses + bonusReussite + bonusDecouverte, xp_reponses: xpReponses,
    bonus_reussite: bonusReussite, bonus_decouverte: bonusDecouverte, successRate }
  const stats = structuredClone(prog.stats_par_sous_module)
  const touched = new Set(answers.map(a => questions.find(q => q.id === a.questionId).sous_module_id))
  for (const id of touched) {
    const totals = questions.filter(q => q.sous_module_id === id).reduce((acc, q) => {
      const r = resultats[q.id]
      return { tentatives: acc.tentatives + (r?.tentatives || 0), reussites: acc.reussites + (r?.reussites || 0) }
    }, { tentatives: 0, reussites: 0 })
    stats[id] = { ...totals, taux_reussite: totals.reussites / totals.tentatives, dernier_passage: date }
  }
  return { session: saved, progression: normaliserProgression({ ...prog,
    xp_total: prog.xp_total + saved.xp_gagne, sessions: [...prog.sessions, saved],
    resultats_par_question: resultats, stats_par_sous_module: stats }) }
}
