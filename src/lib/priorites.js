// Noms de classes écrits en entier : Tailwind ne conserve que les classes
// qu'il trouve telles quelles dans le code source. Une concaténation
// ('priority-' + p) serait supprimée du CSS final.
const CLASSES_PRIORITE = {
  P1: 'priority priority-P1',
  P2: 'priority priority-P2',
  P3: 'priority priority-P3',
}

export const classePriorite = priorite => CLASSES_PRIORITE[priorite] || CLASSES_PRIORITE.P1
