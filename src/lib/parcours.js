// Parcours conseillé : dans quel ordre travailler les étapes, et quelle est la prochaine.
import { statsSousModule, SEUIL_MAITRISE, pointsFaibles } from './stats.js'
import { lienBrouillon } from './brouillons.js'

const RANG_PRIORITE = { P1: 1, P2: 2, P3: 3 }

export const lienComprendre = (moduleId, sousModuleId) => '/module/' + moduleId + '/comprendre/' + sousModuleId
export const lienEntrainement = (moduleId, sousModuleId) =>
  '/quiz/' + moduleId + '?submodule=' + sousModuleId + '&mode=long'

/**
 * Toutes les étapes dans l'ordre conseillé : modules par priorité (puis ordre du fichier),
 * étapes par priorité (héritée du module) puis ordre du cours.
 */
export function etapesOrdonnees(modules, questions, resultats) {
  return modules
    .map((m, i) => ({ m, i }))
    .sort((a, b) => RANG_PRIORITE[a.m.priorite] - RANG_PRIORITE[b.m.priorite] || a.i - b.i)
    .flatMap(({ m }) =>
      m.sous_modules
        .map((sm, j) => ({ module: m, sousModule: sm, priorite: sm.priorite || m.priorite, ordre: j }))
        .sort((a, b) => RANG_PRIORITE[a.priorite] - RANG_PRIORITE[b.priorite] || a.ordre - b.ordre)
        .map((e, k) => ({
          ...e,
          numero: k + 1,
          stats: statsSousModule(
            e.sousModule.id,
            questions.filter(q => q.module_id === m.id),
            resultats,
          ),
        })),
    )
}

/**
 * Une seule prochaine étape conseillée, par ordre de priorité :
 * 1. une session commencée → la reprendre ;
 * 2. un sous-module sous 70 % → s'y entraîner à nouveau ;
 * 3. la première étape pas encore travaillée → la comprendre (si pas encore lue), sinon s'entraîner ;
 * 4. la première étape travaillée mais pas maîtrisée (< 80 %) → la consolider ;
 * 5. sinon, tout ce qui est disponible est maîtrisé.
 */
export function prochaineEtape({ modules, questions, resultats, comprendreVus = [], brouillons = [] }) {
  const vus = new Set(comprendreVus)
  const libelleDe = id => modules.find(m => m.id === id)?.label || id

  const brouillon = brouillons.find(b => modules.some(m => m.id === b.moduleId))
  if (brouillon) {
    const sm = modules.find(m => m.id === brouillon.moduleId).sous_modules.find(s => s.id === brouillon.sousModuleId)
    return {
      type: 'reprendre',
      titre: 'Tu étais en pleine session',
      lien: lienBrouillon(brouillon),
      libelle: 'Reprendre où j’en étais',
      detail:
        (sm ? sm.label + ' · ' : '') +
        libelleDe(brouillon.moduleId) +
        ' · ' +
        brouillon.repondues +
        ' question' +
        (brouillon.repondues > 1 ? 's' : '') +
        ' sur ' +
        brouillon.total +
        ' déjà faites',
    }
  }

  const faible = pointsFaibles(modules, questions, resultats)[0]
  if (faible)
    return {
      type: 'reviser',
      titre: 'On y retourne : ' + faible.sousModule.label,
      libelle: 'Retenter cette étape',
      lien: lienEntrainement(faible.module.id, faible.sousModule.id),
      detail: faible.module.label + ' : ' + Math.round(faible.taux * 100) + ' % pour l’instant, ça va venir',
    }

  const etapes = etapesOrdonnees(modules, questions, resultats).filter(
    e => e.stats.nbQuestions > 0 || e.sousModule.comprendre,
  )
  const nouvelle = etapes.find(e => !e.stats.tentatives)
  if (nouvelle) {
    const { module: m, sousModule: sm, numero } = nouvelle
    const detail = m.label + ' · étape ' + numero
    if (sm.comprendre && !vus.has(sm.id))
      return {
        type: 'comprendre',
        titre: 'Découvrir : ' + sm.label,
        detail,
        libelle: 'Lire la leçon',
        lien: lienComprendre(m.id, sm.id),
      }
    if (nouvelle.stats.nbQuestions)
      return {
        type: 'entrainer',
        titre: 'Passer au QCM : ' + sm.label,
        detail,
        libelle: 'Me tester',
        lien: lienEntrainement(m.id, sm.id),
      }
  }

  const aConsolider = etapes.find(e => e.stats.tentatives && e.stats.taux < SEUIL_MAITRISE)
  if (aConsolider)
    return {
      type: 'consolider',
      titre: 'Presque maîtrisé : ' + aConsolider.sousModule.label,
      detail:
        aConsolider.module.label +
        ' : ' +
        Math.round(aConsolider.stats.taux * 100) +
        ' % de réussite, encore un petit effort',
      libelle: 'Me tester encore',
      lien: lienEntrainement(aConsolider.module.id, aConsolider.sousModule.id),
    }

  return {
    type: 'termine',
    titre: 'Tu maîtrises tout ce qui existe pour l’instant',
    detail: 'Bravo ! De nouvelles questions arriveront avec les prochains contenus.',
    libelle: 'Explorer les modules',
    lien: '/modules',
  }
}
