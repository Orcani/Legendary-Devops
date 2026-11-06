// Messages de félicitations et d'encouragement : variés pour ne pas sonner comme une machine.

const BONNES = [
  'Bien vu !',
  'Exactement !',
  'C’est ça !',
  'Bravo !',
  'Bien joué !',
  'Tout juste !',
  'Parfait !',
  'Yes, c’est la bonne !',
]
const FAUSSES = [
  'Pas tout à fait.',
  'Presque, regarde l’explication.',
  'Ce n’est pas celle-là, mais tu vas la retenir.',
  'Raté cette fois, c’est comme ça qu’on apprend.',
]

/** Choix stable pour une question donnée (le message ne change pas si l'écran se redessine). */
const choisir = (liste, graine = '') => {
  let h = 0
  for (const c of String(graine)) h = (h * 31 + c.charCodeAt(0)) >>> 0
  return liste[h % liste.length]
}

export const messageBonneReponse = graine => choisir(BONNES, graine)
export const messageMauvaiseReponse = graine => choisir(FAUSSES, graine)

/** Titre du bilan de session selon le taux de réussite (en %). */
export function titreBilan(taux) {
  if (taux === 100)
    return { emoji: '🏆', titre: 'Sans faute, bravo !', texte: 'Tout juste du début à la fin. Chapeau !' }
  if (taux >= 80)
    return {
      emoji: '🎉',
      titre: 'Bravo, c’est réussi !',
      texte: 'Tu maîtrises bien cette partie. Encore quelques révisions et ce sera du solide.',
    }
  if (taux >= 50)
    return {
      emoji: '💪',
      titre: 'Bien joué, tu progresses',
      texte:
        'Plus de la moitié de bonnes réponses. Revois tes erreurs juste en dessous, c’est là que tu vas le plus apprendre.',
    }
  return {
    emoji: '🌱',
    titre: 'Session terminée, c’est un début',
    texte: 'Ce sont souvent les premières sessions les plus difficiles. Relis la leçon puis retente, ça va venir.',
  }
}
