export function sousModuleVu(id, questions, resultats) {
  return questions.some(q => q.sous_module_id === id && (resultats[q.id]?.tentatives || 0) > 0)
}
export function questionsDisponibles({ questions, modules, resultats, moduleId, sousModuleId, scope }) {
  const module = modules.find(m => m.id === moduleId)
  if (!module) return []
  if (sousModuleId && !module.sous_modules.some(sm => sm.id === sousModuleId)) return []
  return questions.filter(
    q =>
      q.module_id === moduleId &&
      (!sousModuleId || q.sous_module_id === sousModuleId) &&
      (scope !== 'seen' || sousModuleVu(q.sous_module_id, questions, resultats)),
  )
}
export function tirerQuestions(pool, limit, random = Math.random) {
  const copy = [...pool]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, limit || copy.length)
}

// Tailles de session (D-50) : on ne fait jamais tout un module d'un coup.
export const TAILLE_RAPIDE = 10
export const MAX_SESSION_MODULE = 35
export const MAX_SESSION_ETAPE = 15

/** Nombre de questions d'une session selon le mode, la portée et la banque disponible. */
export function tailleSession({ mode, sousModuleId, disponibles }) {
  if (mode === 'short') return Math.min(TAILLE_RAPIDE, disponibles)
  return Math.min(sousModuleId ? MAX_SESSION_ETAPE : MAX_SESSION_MODULE, disponibles)
}
