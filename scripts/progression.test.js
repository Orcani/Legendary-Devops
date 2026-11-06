import test from 'node:test'
import assert from 'node:assert/strict'
import { enregistrerSession, calculerNiveauDepuisXP } from '../shared/progression.js'
import { questionsDisponibles, tirerQuestions } from '../src/lib/selection.js'
import { questionAcquise, maitriseEtape, evaluerPoste, evaluerSocle, prochainRepere } from '../src/lib/objectif.js'
const questions = Array.from({ length: 12 }, (_, i) => ({
  id: 'q' + i,
  module_id: 'm',
  sous_module_id: i < 6 ? 's1' : 's2',
  choix: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }],
  reponse_correcte: 'a',
}))
const make = (id, n = 2, correct = n) => ({
  id,
  module_id: 'm',
  duree_secondes: 10,
  answers: questions.slice(0, n).map((q, i) => ({ questionId: q.id, selectedChoice: i < correct ? 'a' : 'b' })),
})
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
  assert.deepEqual(next.progression.resultats_par_question.q1, { tentatives: 2, reussites: 1, derniere: true })
  assert.equal(next.progression.stats_par_sous_module.s1.taux_reussite, 0.75)
})
test('80 % donne 20 XP de bonus, pas 50', () => {
  const r = enregistrerSession({}, make('first', 5, 4), questions)
  assert.equal(r.session.bonus_reussite, 20)
  assert.equal(r.session.xp_gagne, 90)
})
test('un pourcentage arrondi à 80 % ne déclenche pas le bonus', () => {
  const many = Array.from({ length: 101 }, (_, i) => ({ ...questions[0], id: 'q' + i }))
  const s = {
    id: 'round',
    module_id: 'm',
    answers: many.map((q, i) => ({ questionId: q.id, selectedChoice: i < 80 ? 'a' : 'b' })),
  }
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
const modules = [{ id: 'm', sous_modules: [{ id: 's1' }, { id: 's2' }] }]
test('sélections : module, sous-module, déjà pratiqués et sous-module inconnu', () => {
  const base = { questions, modules, resultats: { q0: { tentatives: 1 } }, moduleId: 'm' }
  assert.equal(questionsDisponibles(base).length, 12)
  assert.equal(questionsDisponibles({ ...base, sousModuleId: 's2' }).length, 6)
  assert.equal(questionsDisponibles({ ...base, scope: 'seen' }).length, 6)
  assert.equal(questionsDisponibles({ ...base, sousModuleId: 'unknown' }).length, 0)
  assert.equal(questionsDisponibles({ ...base, resultats: {}, scope: 'seen' }).length, 0)
})

test('tirage court limité à 10, long exhaustif, sans doublons ni mutation', () => {
  const original = structuredClone(questions)
  assert.equal(tirerQuestions(questions, 10).length, 10)
  assert.equal(tirerQuestions(questions, 0).length, 12)
  assert.equal(new Set(tirerQuestions(questions, 10).map(q => q.id)).size, 10)
  assert.equal(tirerQuestions(questions.slice(0, 2), 10).length, 2)
  assert.deepEqual(questions, original)
})

// --- Statistiques du tableau de bord (src/lib/stats.js) ---
test('statuts des sous-modules : seuils 70 % et 80 %', async () => {
  const { statutDepuisTaux } = await import('../src/lib/stats.js')
  assert.equal(statutDepuisTaux(0, 0), 'non-commence')
  assert.equal(statutDepuisTaux(4, 0.5), 'en-acquisition')
  assert.equal(statutDepuisTaux(4, 0.75), 'en-progres')
  assert.equal(statutDepuisTaux(4, 0.8), 'maitrise')
})

test('points faibles : sous 70 %, triés du plus bas au plus haut, non travaillés exclus', async () => {
  const { pointsFaibles } = await import('../src/lib/stats.js')
  const mods = [{ id: 'm', priorite: 'P1', sous_modules: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }] }]
  const qs = ['a', 'b', 'c', 'd'].map(s => ({ id: 'q-' + s, module_id: 'm', sous_module_id: s }))
  const r = {
    'q-a': { tentatives: 4, reussites: 1 },
    'q-b': { tentatives: 2, reussites: 1 },
    'q-c': { tentatives: 2, reussites: 2 },
  }
  assert.deepEqual(
    pointsFaibles(mods, qs, r).map(p => p.sousModule.id),
    ['a', 'b'],
  )
})

test('vue d’ensemble : questions répondues, taux global, modules non commencés', async () => {
  const { statsGlobales } = await import('../src/lib/stats.js')
  const mods = [
    { id: 'm1', sous_modules: [] },
    { id: 'm2', sous_modules: [] },
    { id: 'm3', sous_modules: [] },
  ]
  const qs = [
    { id: 'x', module_id: 'm1' },
    { id: 'y', module_id: 'm1' },
    { id: 'z', module_id: 'm2' },
  ]
  const g = statsGlobales(mods, qs, { x: { tentatives: 3, reussites: 2 }, y: { tentatives: 1, reussites: 1 } }, [
    { module_id: 'm1' },
  ])
  assert.equal(g.questionsRepondues, 2)
  assert.equal(g.taux, 0.75)
  // m3 n'a pas de question : il n'est pas compté comme « à découvrir »
  assert.deepEqual(
    g.modulesNonCommences.map(m => m.id),
    ['m2'],
  )
  assert.equal(g.modulesCommences, 1)
  assert.equal(g.modulesAvecQuestions, 2)
  // Aucune mécanique de série (choix AuDHD-friendly, D-22)
  assert.equal('serie' in g, false)
})

// --- Parcours conseillé (src/lib/parcours.js) ---
const MODULES_PARCOURS = [
  { id: 'git', priorite: 'P1', label: 'Git', sous_modules: [{ id: 'g1', label: 'Bases' }] },
  {
    id: 'linux',
    priorite: 'P1',
    label: 'Linux',
    sous_modules: [
      { id: 'l1', label: 'Arborescence', comprendre: { objectifs: ['x'] } },
      { id: 'l2', label: 'Droits' },
    ],
  },
  { id: 'cloud', priorite: 'P2', label: 'Cloud', sous_modules: [{ id: 'c1', label: 'Bases' }] },
]
const QUESTIONS_PARCOURS = [
  { id: 'q-g1', module_id: 'git', sous_module_id: 'g1' },
  { id: 'q-l1', module_id: 'linux', sous_module_id: 'l1' },
  { id: 'q-l2', module_id: 'linux', sous_module_id: 'l2' },
  { id: 'q-c1', module_id: 'cloud', sous_module_id: 'c1' },
]

test('prochaine étape : une session commencée passe avant tout', async () => {
  const { prochaineEtape } = await import('../src/lib/parcours.js')
  const e = prochaineEtape({
    modules: MODULES_PARCOURS,
    questions: QUESTIONS_PARCOURS,
    resultats: {},
    brouillons: [{ moduleId: 'linux', sousModuleId: 'l2', portee: 'all', mode: 'long', repondues: 3, total: 10 }],
  })
  assert.equal(e.type, 'reprendre')
  assert.match(e.lien, /^\/quiz\/linux\?mode=long&scope=all&submodule=l2&reprendre=1$/)
})

test('prochaine étape : un point faible passe avant une nouvelle étape', async () => {
  const { prochaineEtape } = await import('../src/lib/parcours.js')
  const e = prochaineEtape({
    modules: MODULES_PARCOURS,
    questions: QUESTIONS_PARCOURS,
    resultats: { 'q-l2': { tentatives: 4, reussites: 1 } },
  })
  assert.equal(e.type, 'reviser')
  assert.equal(e.lien, '/quiz/linux?submodule=l2&mode=long')
})

test('prochaine étape : première étape P1, « Comprendre » d’abord si pas encore lu', async () => {
  const { prochaineEtape } = await import('../src/lib/parcours.js')
  const r = { 'q-g1': { tentatives: 1, reussites: 1 } }
  const e1 = prochaineEtape({ modules: MODULES_PARCOURS, questions: QUESTIONS_PARCOURS, resultats: r })
  assert.equal(e1.type, 'comprendre')
  assert.equal(e1.lien, '/module/linux/comprendre/l1')
  const e2 = prochaineEtape({
    modules: MODULES_PARCOURS,
    questions: QUESTIONS_PARCOURS,
    resultats: r,
    comprendreVus: ['l1'],
  })
  assert.equal(e2.type, 'entrainer')
  assert.equal(e2.lien, '/quiz/linux?submodule=l1&mode=long')
})

test('prochaine étape : consolider puis terminé', async () => {
  const { prochaineEtape } = await import('../src/lib/parcours.js')
  const tout = ok => Object.fromEntries(QUESTIONS_PARCOURS.map(q => [q.id, { tentatives: 4, reussites: ok }]))
  assert.equal(
    prochaineEtape({ modules: MODULES_PARCOURS, questions: QUESTIONS_PARCOURS, resultats: tout(3) }).type,
    'consolider',
  )
  assert.equal(
    prochaineEtape({ modules: MODULES_PARCOURS, questions: QUESTIONS_PARCOURS, resultats: tout(4) }).type,
    'termine',
  )
})

test('brouillons en cours : lus depuis le stockage, sans les brouillons vides ou en cours d’envoi', async () => {
  const { brouillonsEnCours, PREFIXE_BROUILLON } = await import('../src/lib/brouillons.js')
  const donnees = {
    [PREFIXE_BROUILLON + 'linux::all:short']: JSON.stringify({ ids: ['a', 'b'], answers: { a: {} }, startedAt: 2 }),
    [PREFIXE_BROUILLON + 'git:g1:all:long']: JSON.stringify({ ids: ['c'], answers: {}, startedAt: 3 }),
    [PREFIXE_BROUILLON + 'cloud::all:long']: JSON.stringify({
      ids: ['d'],
      answers: { d: {} },
      startedAt: 1,
      finishing: true,
    }),
    autre: 'x',
  }
  const stockage = { ...donnees, getItem: k => donnees[k] }
  const liste = brouillonsEnCours(stockage)
  assert.equal(liste.length, 1)
  assert.deepEqual(
    [liste[0].moduleId, liste[0].sousModuleId, liste[0].mode, liste[0].repondues],
    ['linux', null, 'short', 1],
  )
})

test('palier de difficulté : niveau général et révisions du module', async () => {
  const { palierDifficulte } = await import('../src/lib/difficulte.js')
  assert.equal(palierDifficulte({ niveau: 1, sessionsModule: 0, tauxModule: null }), 'debutant')
  assert.equal(palierDifficulte({ niveau: 1, sessionsModule: 2, tauxModule: 0.65 }), 'intermediaire')
  assert.equal(palierDifficulte({ niveau: 1, sessionsModule: 5, tauxModule: 0.5 }), 'debutant') // beaucoup révisé mais fragile
  assert.equal(palierDifficulte({ niveau: 7, sessionsModule: 0, tauxModule: null }), 'intermediaire') // nouveau module, bon niveau général
  assert.equal(palierDifficulte({ niveau: 7, sessionsModule: 1, tauxModule: 0.3 }), 'debutant')
  assert.equal(palierDifficulte({ niveau: 2, sessionsModule: 4, tauxModule: 0.85 }), 'avance')
  assert.equal(palierDifficulte({ niveau: 16, sessionsModule: 1, tauxModule: 0.75 }), 'avance')
})

test('tirage adapté : proportion selon le palier, du plus facile au plus difficile', async () => {
  const { tirerQuestionsAdaptees } = await import('../src/lib/difficulte.js')
  const pool = ['debutant', 'intermediaire', 'avance'].flatMap(d =>
    Array.from({ length: 30 }, (_, i) => ({ id: d + i, difficulte: d })),
  )
  let graine = 7
  const hasard = () => (graine = (graine * 16807) % 2147483647) / 2147483647
  const compter = palier => {
    const n = { debutant: 0, intermediaire: 0, avance: 0 }
    for (let i = 0; i < 200; i++) for (const q of tirerQuestionsAdaptees(pool, 10, palier, hasard)) n[q.difficulte]++
    return n
  }
  const deb = compter('debutant'),
    av = compter('avance')
  assert.ok(deb.debutant > deb.intermediaire && deb.intermediaire > deb.avance)
  assert.ok(av.avance > av.intermediaire && av.intermediaire > av.debutant)
  const tirage = tirerQuestionsAdaptees(pool, 10, 'intermediaire', hasard)
  assert.equal(tirage.length, 10)
  assert.equal(new Set(tirage.map(q => q.id)).size, 10)
  const rangs = tirage.map(q => ['debutant', 'intermediaire', 'avance'].indexOf(q.difficulte))
  assert.deepEqual(
    rangs,
    [...rangs].sort((a, b) => a - b),
  )
  assert.equal(tirerQuestionsAdaptees(pool, 0, 'avance', hasard).length, 90) // « Toutes les questions »
})

test('tailles de session et priorité aux questions nouvelles ou ratées', async () => {
  const { tailleSession } = await import('../src/lib/selection.js')
  const { prioriteHistorique } = await import('../src/lib/difficulte.js')
  assert.equal(tailleSession({ mode: 'long', disponibles: 60 }), 35)
  assert.equal(tailleSession({ mode: 'long', sousModuleId: 'x', disponibles: 22 }), 15)
  assert.equal(tailleSession({ mode: 'long', sousModuleId: 'x', disponibles: 8 }), 8)
  assert.equal(tailleSession({ mode: 'short', disponibles: 60 }), 10)
  assert.equal(prioriteHistorique(undefined), 3)
  assert.equal(prioriteHistorique({ tentatives: 3, reussites: 2, derniere: false }), 2.5)
  assert.equal(prioriteHistorique({ tentatives: 3, reussites: 3, derniere: true }), 0.3)
})

test('objectif : étapes acquises, repères et étapes bloquantes', () => {
  assert.equal(questionAcquise(undefined), false)
  assert.equal(questionAcquise({ tentatives: 2, reussites: 1, derniere: false }), false)
  assert.equal(questionAcquise({ tentatives: 2, reussites: 1, derniere: true }), true)
  assert.equal(questionAcquise({ tentatives: 2, reussites: 1 }), true) // ancien historique sans « derniere »
  const modules = [
    {
      id: 'm',
      sous_modules: [
        { id: 's1', label: 'Un' },
        { id: 's2', label: 'Deux' },
      ],
    },
  ]
  const ok = ids => Object.fromEntries(ids.map(id => [id, { tentatives: 1, reussites: 1, derniere: true }]))
  assert.deepEqual(maitriseEtape('s1', questions, ok(['q0', 'q1', 'q2'])), {
    acquises: 3,
    total: 6,
    ratio: 0.5,
    commencee: true,
  })
  const poste = { indispensable: ['s1', 's2'], apprecie: [] }
  // Rien de fait : aucun repère, tout est à travailler.
  const vide = evaluerPoste(poste, modules, questions, {})
  assert.equal(vide.repere, null)
  assert.equal(prochainRepere(vide).id, 'bases')
  assert.equal(vide.aTravailler.length, 2)
  // s1 complet, s2 vide : moyenne 50 % → bases posées, mais s2 bloque « Tu peux postuler ».
  const moitie = evaluerPoste(poste, modules, questions, ok(['q0', 'q1', 'q2', 'q3', 'q4', 'q5']))
  assert.equal(moitie.repere.id, 'bases')
  assert.equal(moitie.bloquantes.length, 1)
  assert.equal(moitie.aTravailler[0].sousModule.id, 's2')
  // s1 complet, s2 à 4/6 (67 %) : moyenne 83 %, plus rien de bloquant → on peut postuler.
  const pret = evaluerPoste(poste, modules, questions, ok(['q0', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9']))
  assert.equal(pret.prete, true)
  assert.equal(pret.repere.id, 'prete')
  assert.equal(prochainRepere(pret).id, 'solide')
  const socle = evaluerSocle(['s1', 's2', 'inconnu'], modules, questions, ok(['q0', 'q1', 'q2', 'q3', 'q4', 'q5']))
  assert.equal(socle.etapes.length, 2)
  assert.equal(socle.solide, false)
  assert.equal(socle.aConsolider[0].sousModule.id, 's2')
})
