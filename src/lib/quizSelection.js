export function sousModuleVu(id, questions, resultats) {
  return questions.some(q => q.sous_module_id === id && (resultats[q.id]?.tentatives || 0) > 0)
}
export function questionPool({ questions, modules, resultats, moduleId, sousModuleId, scope }) {
  const module = modules.find(m => m.id === moduleId)
  if (!module) return []
  if (sousModuleId && !module.sous_modules.some(sm => sm.id === sousModuleId)) return []
  return questions.filter(q => q.module_id === moduleId &&
    (!sousModuleId || q.sous_module_id === sousModuleId) &&
    (scope !== 'seen' || sousModuleVu(q.sous_module_id, questions, resultats)))
}
export function tirerQuestions(pool, limit, random = Math.random) {
  const copy = [...pool]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy.slice(0, limit || copy.length)
}
