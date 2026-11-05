import test from 'node:test'
import assert from 'node:assert/strict'
import { enregistrerSession, calculerNiveauDepuisXP } from '../shared/progression.js'
import { questionPool, tirerQuestions } from '../src/lib/quizSelection.js'
const questions = Array.from({ length: 12 }, (_, i) => ({
  id: 'q' + i, module_id: 'm', sous_module_id: i < 6 ? 's1' : 's2',
  choix: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }], reponse_correcte: 'a',
}))
const make = (id, n = 2, correct = n) => ({ id, module_id: 'm', duree_secondes: 10,
  answers: questions.slice(0,n).map((q,i) => ({ questionId: q.id, selectedChoice: i < correct ? 'a' : 'b' })) })
test('premier passage, réponses et bonus parfait', () => {
  const r = enregistrerSession({}, make('first'), questions)
  assert.equal(r.session.xp_gagne, 100)
  assert.equal(r.progression.niveau, 2)
  assert.equal(r.progression.sessions.length, 1)
})
test('nouvelle tentative : 5 XP, compteurs et statistiques cumulés', () => {
  const first = enregistrerSession({}, make('first', 2, 1), questions)
  const next = enregistrerSession(first.progression, make('second'), questions)
  assert.equal(next.session.xp_reponses, 10)
  assert.equal(next.session.bonus_decouverte, 0)
  assert.deepEqual(next.progression.resultats_par_question.q1, { tentatives: 2, reussites: 1 })
  assert.equal(next.progression.stats_par_sous_module.s1.taux_reussite, 0.75)
})
test('80 % donne 20 XP de bonus, pas 50', () => {
  const r = enregistrerSession({}, make('first', 5, 4), questions)
  assert.equal(r.session.bonus_reussite, 20)
  assert.equal(r.session.xp_gagne, 90)
})
test('un pourcentage arrondi à 80 % ne déclenche pas le bonus', () => {
  const many = Array.from({length: 101}, (_,i) => ({...questions[0], id: 'q' + i}))
  const s = { id: 'round', module_id: 'm', answers: many.map((q,i) => ({questionId:q.id,selectedChoice:i<80?'a':'b'})) }
  assert.equal(enregistrerSession({}, s, many).session.bonus_reussite, 0)
})
test('réessai de la même session après redémarrage sans double crédit', () => {
  const first = enregistrerSession({}, make('same'), questions)
  const restored = JSON.parse(JSON.stringify(first.progression))
  assert.deepEqual(enregistrerSession(restored, make('same'), questions).progression, restored)
})
test('validation avant toute mutation', () => {
  const prog = enregistrerSession({}, make('first'), questions).progression
  const snapshot = structuredClone(prog)
  const bad = make('bad')
  bad.answers[1].questionId = 'unknown'
  assert.throws(() => enregistrerSession(prog, bad, questions))
  assert.deepEqual(prog, snapshot)
  assert.throws(() => enregistrerSession(prog, { ...bad, answers: [bad.answers[0], bad.answers[0]] }, questions))
})
test('persistance : sérialisation, relecture et nouveau gain', () => {
  const saved = JSON.stringify(enregistrerSession({}, make('a'), questions).progression)
  const next = enregistrerSession(JSON.parse(saved), make('b'), questions)
  assert.equal(next.progression.xp_total, 160)
  assert.equal(next.progression.sessions.length, 2)
})
test('niveau maximum et seuil exact', () => {
  assert.equal(calculerNiveauDepuisXP(99).niveau, 1)
  assert.equal(calculerNiveauDepuisXP(100).niveau, 2)
  assert.equal(calculerNiveauDepuisXP(1e9).niveau, 50)
})
const modules = [{id:'m',sous_modules:[{id:'s1'},{id:'s2'}]}]
test('sélections : module, sous-module, déjà pratiqués et sous-module inconnu', () => {
  const base = {questions,modules,resultats:{q0:{tentatives:1}},moduleId:'m'}
  assert.equal(questionPool(base).length,12)
  assert.equal(questionPool({...base,sousModuleId:'s2'}).length,6)
  assert.equal(questionPool({...base,scope:'seen'}).length,6)
  assert.equal(questionPool({...base,sousModuleId:'unknown'}).length,0)
  assert.equal(questionPool({...base,resultats:{},scope:'seen'}).length,0)
})

test('tirage court limité à 10, long exhaustif, sans doublons ni mutation', () => {
  const original = structuredClone(questions)
  assert.equal(tirerQuestions(questions,10).length,10)
  assert.equal(tirerQuestions(questions,0).length,12)
  assert.equal(new Set(tirerQuestions(questions,10).map(q => q.id)).size,10)
  assert.equal(tirerQuestions(questions.slice(0,2),10).length,2)
  assert.deepEqual(questions,original)
})

// --- Statistiques du tableau de bord (src/lib/stats.js) ---
test('statuts des sous-modules : seuils 70 % et 80 %', async () => {
  const { statutDepuisTaux } = await import('../src/lib/stats.js')
  assert.equal(statutDepuisTaux(0, 0), 'non-commence')
  assert.equal(statutDepuisTaux(4, 0.5), 'a-retravailler')
  assert.equal(statutDepuisTaux(4, 0.75), 'en-progres')
  assert.equal(statutDepuisTaux(4, 0.8), 'maitrise')
})

test('points faibles : sous 70 %, triés du plus bas au plus haut, non travaillés exclus', async () => {
  const { pointsFaibles } = await import('../src/lib/stats.js')
  const mods = [{ id: 'm', priorite: 'P1', sous_modules: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }] }]
  const qs = ['a', 'b', 'c', 'd'].map(s => ({ id: 'q-' + s, module_id: 'm', sous_module_id: s }))
  const r = { 'q-a': { tentatives: 4, reussites: 1 }, 'q-b': { tentatives: 2, reussites: 1 }, 'q-c': { tentatives: 2, reussites: 2 } }
  assert.deepEqual(pointsFaibles(mods, qs, r).map(p => p.sousModule.id), ['a', 'b'])
})

test('vue d’ensemble : questions répondues, taux global, modules non commencés', async () => {
  const { statsGlobales } = await import('../src/lib/stats.js')
  const mods = [{ id: 'm1', sous_modules: [] }, { id: 'm2', sous_modules: [] }, { id: 'm3', sous_modules: [] }]
  const qs = [{ id: 'x', module_id: 'm1' }, { id: 'y', module_id: 'm1' }, { id: 'z', module_id: 'm2' }]
  const g = statsGlobales(mods, qs, { x: { tentatives: 3, reussites: 2 }, y: { tentatives: 1, reussites: 1 } }, [{ module_id: 'm1' }])
  assert.equal(g.questionsRepondues, 2)
  assert.equal(g.taux, 0.75)
  // m3 n'a pas de question : il n'est pas compté comme « à découvrir »
  assert.deepEqual(g.modulesNonCommences.map(m => m.id), ['m2'])
  assert.equal(g.modulesCommences, 1)
  assert.equal(g.modulesAvecQuestions, 2)
  // Aucune mécanique de série (choix AuDHD-friendly, D-22)
  assert.equal('serie' in g, false)
})
