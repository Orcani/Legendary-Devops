#!/usr/bin/env node
// Vérifie public/data/dataApp.json avant chaque build.
// Erreurs (bloquantes) : ce qui casserait l'application. Avertissements : ce qui reste à compléter.
// Usage : npm run validate-data   (ou node scripts/validate-data.mjs <chemin.json>)
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const fichier = process.argv[2] || path.join(racine, 'public/data/dataApp.json')
const erreurs = [],
  avertissements = []
const erreur = (ou, msg) => erreurs.push(ou + ' : ' + msg)
const avert = (ou, msg) => avertissements.push(ou + ' : ' + msg)

// Icônes réellement disponibles : lues dans la table de ModuleIcon.jsx (source unique).
function iconesDisponibles() {
  const source = fs.readFileSync(path.join(racine, 'src/components/shared/ModuleIcon.jsx'), 'utf8')
  const table = source.match(/const ICONES = \{([\s\S]*?)\n\}/)
  return new Set(table ? [...table[1].matchAll(/'?([a-z][a-z-]*)'?\s*:/g)].map(m => m[1]) : [])
}

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/
const PRIORITES = ['P1', 'P2', 'P3']
const DIFFICULTES = ['debutant', 'intermediaire', 'avance']
const IDS_CHOIX = ['a', 'b', 'c', 'd']
const texte = v => typeof v === 'string' && v.trim().length > 0

let data
try {
  data = JSON.parse(fs.readFileSync(fichier, 'utf8').replace(/^\uFEFF/, ''))
} catch (e) {
  console.error('✖ Lecture impossible de ' + fichier + ' : ' + e.message)
  process.exit(1)
}

for (const cle of ['modules', 'questions', 'lexique'])
  if (!Array.isArray(data[cle])) erreur('racine', `la clé « ${cle} » doit être une liste`)
if (erreurs.length) {
  console.error(erreurs.map(e => '✖ ' + e).join('\n'))
  process.exit(1)
}

const icones = iconesDisponibles()
const modules = new Map(),
  sousModules = new Map(),
  termes = new Set(data.lexique.map(e => e.id))

// --- Modules ---
for (const [i, m] of data.modules.entries()) {
  const ou = `modules[${i}] ${m.id || '(sans id)'}`
  if (!texte(m.id) || !KEBAB.test(m.id)) erreur(ou, 'id manquant ou pas en kebab-case')
  else if (modules.has(m.id)) erreur(ou, 'id en double')
  else modules.set(m.id, m)
  for (const champ of ['label', 'description', 'resume'])
    if (!texte(m[champ])) erreur(ou, `champ « ${champ} » manquant`)
  if (!PRIORITES.includes(m.priorite)) erreur(ou, 'priorite doit valoir P1, P2 ou P3')
  if (!/^#[0-9a-fA-F]{6}$/.test(m.couleur || '')) erreur(ou, 'couleur doit être un code hexadécimal (#RRGGBB)')
  if (!icones.has(m.icon)) avert(ou, `icône « ${m.icon} » absente de ModuleIcon.jsx (une icône livre sera affichée)`)
  if (!/^https?:\/\//.test(m.lien_cours || '')) erreur(ou, 'lien_cours doit être une URL http(s)')
  if (!Array.isArray(m.concepts_cles) || !m.concepts_cles.length) avert(ou, 'concepts_cles vide')
  if (!Array.isArray(m.sous_modules) || !m.sous_modules.length) {
    erreur(ou, 'au moins un sous-module est requis')
    continue
  }
  for (const [j, sm] of m.sous_modules.entries()) {
    const ouSm = `${ou} > sous_modules[${j}] ${sm.id || '(sans id)'}`
    if (!texte(sm.id) || !KEBAB.test(sm.id)) erreur(ouSm, 'id manquant ou pas en kebab-case')
    else if (sousModules.has(sm.id)) erreur(ouSm, 'id déjà utilisé par un autre sous-module')
    else sousModules.set(sm.id, m.id)
    if (!texte(sm.label)) erreur(ouSm, 'champ « label » manquant')
    if (!texte(sm.resume)) erreur(ouSm, 'champ « resume » manquant (2-3 phrases)')
    if (sm.priorite !== undefined && !PRIORITES.includes(sm.priorite)) erreur(ouSm, 'priorite doit valoir P1, P2 ou P3')
    if (sm.comprendre !== undefined) verifierComprendre(ouSm + ' > comprendre', sm.comprendre)
  }
}

// Étape « Comprendre » d'un sous-module (facultative).
function verifierComprendre(ou, c) {
  if (typeof c !== 'object' || c === null) {
    erreur(ou, 'doit être un objet')
    return
  }
  if (!Array.isArray(c.objectifs) || !c.objectifs.length || !c.objectifs.every(texte))
    erreur(ou, 'objectifs : liste de phrases non vide attendue')
  if (!Array.isArray(c.notions) || !c.notions.length) erreur(ou, 'notions : au moins une notion attendue')
  else
    for (const [k, n] of c.notions.entries()) {
      if (!texte(n.titre) || !texte(n.texte)) erreur(`${ou} > notions[${k}]`, 'titre et texte obligatoires')
      if (n.codex !== undefined && !termes.has(n.codex))
        erreur(`${ou} > notions[${k}]`, `fiche Codex « ${n.codex} » introuvable`)
    }
  if (
    c.schema !== undefined &&
    (!Array.isArray(c.schema.etapes) || c.schema.etapes.length < 2 || !c.schema.etapes.every(texte))
  )
    erreur(ou, 'schema.etapes : au moins deux étapes attendues')
  if (c.exemple !== undefined && !texte(c.exemple.code)) erreur(ou, 'exemple.code manquant')
  if (c.a_retenir !== undefined && !texte(c.a_retenir)) erreur(ou, 'a_retenir vide')
}

// --- Questions ---
const idsQuestions = new Set()
for (const [i, q] of data.questions.entries()) {
  const ou = `questions[${i}] ${q.id || '(sans id)'}`
  if (!texte(q.id)) erreur(ou, 'id manquant')
  else if (idsQuestions.has(q.id)) erreur(ou, 'id en double')
  else idsQuestions.add(q.id)
  if (!modules.has(q.module_id)) erreur(ou, `module_id « ${q.module_id} » inconnu`)
  if (sousModules.get(q.sous_module_id) !== q.module_id)
    erreur(ou, `sous_module_id « ${q.sous_module_id} » n'appartient pas au module « ${q.module_id} »`)
  if (!DIFFICULTES.includes(q.difficulte)) erreur(ou, 'difficulte doit valoir debutant, intermediaire ou avance')
  for (const champ of ['enonce', 'explication_correcte', 'explication_erreur'])
    if (!texte(q[champ])) erreur(ou, `champ « ${champ} » manquant`)
  if (!Array.isArray(q.choix) || q.choix.length !== 4) erreur(ou, 'il faut exactement 4 choix')
  else {
    const ids = q.choix.map(c => c.id)
    if (ids.slice().sort().join() !== IDS_CHOIX.join()) erreur(ou, 'les choix doivent avoir les ids a, b, c et d')
    if (q.choix.some(c => !texte(c.texte))) erreur(ou, "un choix n'a pas de texte")
    if (new Set(q.choix.map(c => c.texte?.trim())).size !== 4) erreur(ou, 'deux choix ont le même texte')
    if (!ids.includes(q.reponse_correcte))
      erreur(ou, `reponse_correcte « ${q.reponse_correcte} » ne correspond à aucun choix`)
  }
  if (q.astuce !== undefined && !texte(q.astuce)) avert(ou, 'astuce vide : supprimez le champ ou complétez-le')
  for (const t of q.termes_lexique || [])
    if (!termes.has(t)) erreur(ou, `terme Codex « ${t} » introuvable dans « lexique »`)
}

// --- Codex (clé « lexique ») ---
const vus = new Set()
for (const [i, e] of data.lexique.entries()) {
  const ou = `lexique[${i}] ${e.id || '(sans id)'}`
  if (!texte(e.id) || !KEBAB.test(e.id)) erreur(ou, 'id manquant ou pas en kebab-case')
  else if (vus.has(e.id)) erreur(ou, 'id en double')
  vus.add(e.id)
  for (const champ of ['terme', 'categorie', 'definition', 'role_cicd'])
    if (!texte(e[champ])) erreur(ou, `champ « ${champ} » manquant`)
  if (!modules.has(e.module_id)) erreur(ou, `module_id « ${e.module_id} » inconnu`)
  if (!texte(e.en_bref)) avert(ou, 'pas de phrase « en_bref » : la fiche affiche la définition à la place')
  if (e.analogie !== undefined && !texte(e.analogie)) erreur(ou, '« analogie » doit être un texte')
  for (const v of e.voir_aussi || [])
    if (!termes.has(v)) avert(ou, `voir_aussi « ${v} » : fiche pas encore rédigée (bouton désactivé)`)
}

// --- Objectifs (page « Mon objectif », D-52) : facultatif ---
if (data.objectifs !== undefined) {
  const o = data.objectifs
  const etapeConnue = (ou, id) => {
    if (!sousModules.has(id)) erreur(ou, `étape « ${id} » inconnue`)
  }
  if (!Array.isArray(o.socle) || !o.socle.length) erreur('objectifs.socle', "liste d'étapes non vide attendue")
  else o.socle.forEach(id => etapeConnue('objectifs.socle', id))
  if (!Array.isArray(o.postes) || !o.postes.length) erreur('objectifs.postes', 'au moins un poste attendu')
  else {
    const vusPostes = new Set()
    for (const [i, p] of o.postes.entries()) {
      const ou = `objectifs.postes[${i}] ${p.id || '(sans id)'}`
      if (!texte(p.id) || !KEBAB.test(p.id)) erreur(ou, 'id manquant ou pas en kebab-case')
      else if (vusPostes.has(p.id)) erreur(ou, 'id en double')
      vusPostes.add(p.id)
      if (!texte(p.intitule) || !texte(p.resume)) erreur(ou, 'intitule et resume obligatoires')
      if (!Array.isArray(p.indispensable) || !p.indispensable.length) erreur(ou, 'indispensable : au moins une étape')
      else p.indispensable.forEach(id => etapeConnue(ou, id))
      if (!Array.isArray(p.apprecie)) erreur(ou, 'apprecie : liste attendue (même vide)')
      else p.apprecie.forEach(id => etapeConnue(ou, id))
    }
  }
}

// --- Bilan ---
for (const m of modules.values())
  if (!data.questions.some(q => q.module_id === m.id)) avert(`module ${m.id}`, "aucune question pour l'instant")
for (const m of modules.values())
  for (const sm of m.sous_modules || [])
    if (!sm.comprendre && data.questions.some(q => q.sous_module_id === sm.id))
      avert(`sous-module ${sm.id}`, "des questions mais pas encore d'étape « Comprendre »")
// Banque minimale par étape (D-51) : en dessous, une session de 10 à 15 questions repasse toujours les mêmes.
const MIN_QUESTIONS_ETAPE = 10
for (const m of modules.values())
  for (const sm of m.sous_modules || []) {
    const n = data.questions.filter(q => q.sous_module_id === sm.id).length
    if (n > 0 && n < MIN_QUESTIONS_ETAPE)
      erreur(`sous-module ${sm.id}`, `${n} questions : il en faut au moins ${MIN_QUESTIONS_ETAPE}`)
  }

const resume = `${data.modules.length} modules, ${data.questions.length} questions, ${data.lexique.length} fiches Codex`
if (avertissements.length) console.warn(avertissements.map(a => '⚠ ' + a).join('\n'))
if (erreurs.length) {
  console.error(erreurs.map(e => '✖ ' + e).join('\n'))
  console.error(`\n✖ dataApp.json invalide : ${erreurs.length} erreur(s). (${resume})`)
  process.exit(1)
}
console.log(
  `✔ dataApp.json valide : ${resume}` + (avertissements.length ? `, ${avertissements.length} avertissement(s)` : ''),
)
