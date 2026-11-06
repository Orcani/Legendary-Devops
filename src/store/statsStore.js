import { create } from 'zustand'
import { PREFIXE_BROUILLON } from '../lib/brouillons'
import {
  normaliserProgression,
  enregistrerSession,
  calculerNiveauDepuisXP,
  NIVEAU_MAX,
  xpRequis,
} from '../../shared/progression'

export { calculerNiveauDepuisXP, NIVEAU_MAX, xpRequis }

export const TITRES = [
  [1, 3, 'Stagiaire DevOps', '🧑‍💻'],
  [4, 7, 'Junior DevOps', '🔧'],
  [8, 12, 'DevOps Engineer', '⚙️'],
  [13, 18, 'DevOps Confirmé', '🚀'],
  [19, 25, 'DevOps Senior', '🏗️'],
  [26, 33, 'DevSecOps Expert', '🔐'],
  [34, 42, 'Principal Engineer', '🌐'],
  [43, 49, 'Staff Engineer', '🏆'],
  [50, 50, 'Légende du DevOps', '⚡'],
].map(([min, max, titre, emoji]) => ({ min, max, titre, emoji }))

export const titrePourNiveau = niveau => TITRES.find(t => niveau >= t.min && niveau <= t.max) || TITRES[0]

// Clés du stockage local (préférences et repères de l'interface, propres à l'appareil).
const CLE_THEME = 'devops-quiz-theme'
const CLE_COMPRENDRE = 'devops-quiz-comprendre-vus'
const CLE_INTRO = 'devops-quiz-intro-vue'
const CLE_PROGRESSION_NAVIGATEUR = 'devops-quiz-progression'

const lire = (cle, repli) => {
  try {
    const valeur = JSON.parse(localStorage.getItem(cle))
    return valeur ?? repli
  } catch {
    return repli
  }
}
const ecrire = (cle, valeur) => {
  try {
    localStorage.setItem(cle, JSON.stringify(valeur))
  } catch {
    /* stockage indisponible : la préférence ne sera pas mémorisée */
  }
}

// L'ancienne clé du middleware `persist` (doublon du thème) est retirée.
try {
  localStorage.removeItem('devops-quiz-ui-state')
} catch {
  /* stockage indisponible */
}

// Thème mémorisé, sinon celui du système (mode jour le plus souvent).
function themeInitial() {
  try {
    const memo = localStorage.getItem(CLE_THEME)
    if (memo === 'light' || memo === 'dark') return memo
  } catch {
    /* stockage indisponible */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

let loading

const useStatsStore = create((set, get) => ({
  ...normaliserProgression(),
  modules: [],
  questions: [],
  lexique: [],
  objectifs: { socle: [], postes: [] },
  dataLoaded: false,
  dataError: null,
  ready: false,
  progressionError: null,
  theme: themeInitial(),
  // Étapes « Comprendre » déjà ouvertes (ids de sous-modules) et introduction déjà vue.
  comprendre_vus: Array.isArray(lire(CLE_COMPRENDRE, [])) ? lire(CLE_COMPRENDRE, []) : [],
  intro_vue: lire(CLE_INTRO, false) === true,

  loadData: async () => {
    if (get().dataLoaded) return
    if (loading) return loading
    loading = (async () => {
      try {
        let data
        if (window.electronAPI) {
          const result = await window.electronAPI.loadData()
          if (!result.success) throw new Error(result.error)
          data = result.data
        } else {
          const res = await fetch(import.meta.env.BASE_URL + 'data/dataApp.json')
          if (!res.ok) throw new Error('Chargement des questions impossible.')
          data = await res.json()
        }
        if (!Array.isArray(data.modules) || !Array.isArray(data.questions) || !Array.isArray(data.lexique)) {
          throw new Error('Format de contenu invalide.')
        }
        set({ ...data, dataLoaded: true, dataError: null })
      } catch (e) {
        set({ dataError: e.message })
      } finally {
        loading = null
      }
    })()
    return loading
  },

  loadProgression: async () => {
    try {
      const prog = window.electronAPI
        ? await window.electronAPI.getProgression()
        : JSON.parse(localStorage.getItem(CLE_PROGRESSION_NAVIGATEUR) || '{}')
      set({ ...normaliserProgression(prog), ready: true, progressionError: null })
    } catch (e) {
      set({ ready: false, progressionError: 'Lecture de la progression impossible : ' + e.message })
    }
  },

  saveSession: async session => {
    try {
      if (!get().ready) throw new Error('La progression doit être chargée avant de sauvegarder.')
      const niveauAvant = get().niveau
      let result
      if (window.electronAPI) {
        result = await window.electronAPI.saveSession(session)
        if (!result.success) throw new Error(result.error)
      } else {
        const previous = JSON.parse(localStorage.getItem(CLE_PROGRESSION_NAVIGATEUR) || '{}')
        result = { success: true, ...enregistrerSession(previous, session, get().questions) }
        localStorage.setItem(CLE_PROGRESSION_NAVIGATEUR, JSON.stringify(result.progression))
      }
      set(result.progression)
      return { ...result, niveauAvant }
    } catch (e) {
      return { success: false, error: e.message }
    }
  },

  toggleTheme: () => {
    const theme = get().theme === 'dark' ? 'light' : 'dark'
    try {
      localStorage.setItem(CLE_THEME, theme)
    } catch {
      /* stockage indisponible */
    }
    set({ theme })
  },

  markUnderstood: sousModuleId => {
    const vus = get().comprendre_vus
    if (vus.includes(sousModuleId)) return
    const suivants = [...vus, sousModuleId]
    ecrire(CLE_COMPRENDRE, suivants)
    set({ comprendre_vus: suivants })
  },

  // Repartir de zéro : progression, étapes lues, introduction et sessions en cours. Le thème est conservé.
  resetProgress: async () => {
    try {
      let progression
      if (window.electronAPI) {
        const result = await window.electronAPI.resetProgression()
        if (!result.success) throw new Error(result.error)
        progression = result.progression
      } else {
        localStorage.removeItem(CLE_PROGRESSION_NAVIGATEUR)
        progression = normaliserProgression()
      }
      try {
        for (const cle of Object.keys(localStorage)) {
          if (cle.startsWith(PREFIXE_BROUILLON) || cle === CLE_COMPRENDRE || cle === CLE_INTRO)
            localStorage.removeItem(cle)
        }
      } catch {
        /* stockage indisponible */
      }
      set({ ...progression, comprendre_vus: [], intro_vue: false })
      return { success: true }
    } catch (e) {
      return { success: false, error: e.message }
    }
  },

  markIntroSeen: () => {
    ecrire(CLE_INTRO, true)
    set({ intro_vue: true })
  },
}))

export default useStatsStore
