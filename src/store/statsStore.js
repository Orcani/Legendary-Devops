import { create } from 'zustand'
import { normaliserProgression, enregistrerSession, calculerNiveauDepuisXP, NIVEAU_MAX, xpRequis } from '../../shared/progression'
export { calculerNiveauDepuisXP, NIVEAU_MAX, xpRequis }
export const TITRES = [
  [1,3,'Stagiaire DevOps','🧑‍💻'], [4,7,'Junior DevOps','🔧'],
  [8,12,'DevOps Engineer','⚙️'], [13,18,'DevOps Confirmé','🚀'],
  [19,25,'DevOps Senior','🏗️'], [26,33,'DevSecOps Expert','🔐'],
  [34,42,'Principal Engineer','🌐'], [43,49,'Staff Engineer','🏆'], [50,50,'Légende du DevOps','⚡'],
].map(([min,max,titre,emoji]) => ({min,max,titre,emoji}))
export const getTitre = niveau => TITRES.find(t => niveau >= t.min && niveau <= t.max) || TITRES[0]
let loading
// Le thème est mémorisé dans une seule clé ; l'ancienne clé du middleware `persist` est retirée.
try { localStorage.removeItem('devops-quiz-ui-state') } catch { /* stockage indisponible */ }
const useStatsStore = create((set, get) => ({
  ...normaliserProgression(),
  modules: [], questions: [], lexique: [], dataLoaded: false, dataError: null, ready: false,
  progressionError: null,
  // Thème mémorisé, sinon celui du système (mode jour le plus souvent).
  theme: (() => {
    try {
      const memo = localStorage.getItem('devops-quiz-theme')
      if (memo === 'light' || memo === 'dark') return memo
    } catch { /* stockage indisponible */ }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })(),
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
        if (!Array.isArray(data.modules) || !Array.isArray(data.questions) || !Array.isArray(data.lexique)) throw new Error('Format de contenu invalide.')
        set({ ...data, dataLoaded: true, dataError: null })
      } catch (e) { set({ dataError: e.message }) }
      finally { loading = null }
    })()
    return loading
  },
  loadProgression: async () => {
    try {
      const prog = window.electronAPI
        ? await window.electronAPI.getProgression()
        : JSON.parse(localStorage.getItem('devops-quiz-progression') || '{}')
      set({ ...normaliserProgression(prog), ready: true, progressionError: null })
    } catch (e) { set({ ready: false, progressionError: 'Lecture de la progression impossible : ' + e.message }) }
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
        const previous = JSON.parse(localStorage.getItem('devops-quiz-progression') || '{}')
        result = { success: true, ...enregistrerSession(previous, session, get().questions) }
        localStorage.setItem('devops-quiz-progression', JSON.stringify(result.progression))
      }
      set(result.progression)
      return { ...result, niveauAvant }
    } catch (e) { return { success: false, error: e.message } }
  },
  toggleTheme: () => {
    const theme = get().theme === 'dark' ? 'light' : 'dark'
    localStorage.setItem('devops-quiz-theme', theme)
    set({ theme })
  },
}))
export default useStatsStore
