export const pluriel = (n, mot, motPluriel = mot + 's') => n + ' ' + (n > 1 ? motPluriel : mot)

// 342 → "5 min 42 s" ; 42 → "42 s"
export function formaterDuree(secondes) {
  const s = Math.max(0, Math.round(Number(secondes) || 0))
  const min = Math.floor(s / 60),
    reste = s % 60
  if (!min) return reste + ' s'
  return min + ' min' + (reste ? ' ' + String(reste).padStart(2, '0') + ' s' : '')
}

// Environ 30 secondes par question, arrondi à la minute (minimum 1).
export const estimerMinutes = nbQuestions => Math.max(1, Math.round(nbQuestions * 0.5))

export const LIBELLES_DIFFICULTE = {
  debutant: 'Débutant',
  intermediaire: 'Intermédiaire',
  avance: 'Avancé',
}

export const LIBELLES_PRIORITE = {
  P1: 'L’essentiel, à maîtriser en premier',
  P2: 'Bon à connaître, les bases suffisent',
  P3: 'Pour la culture générale',
}

// Couleur de texte lisible (sombre ou blanche) sur une couleur de fond hexadécimale.
export function couleurTexteSur(hex = '#3B82F6') {
  const v = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4]
    .map(i => parseInt(v.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.4 ? '#0F172A' : '#FFFFFF'
}

// Pour la recherche : minuscules et sans accents ("Démarrer" → "demarrer").
export const normaliser = (texte = '') =>
  texte
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
