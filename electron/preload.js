import electron from 'electron'

const { contextBridge, ipcRenderer } = electron

/**
 * Bridge sécurisé entre le processus Electron (main) et React (renderer).
 * Le preload tourne en mode sandbox : il n'utilise que contextBridge et ipcRenderer,
 * et n'expose jamais Node.js à l'interface.
 *
 * Utilisation dans React :
 *   const data = await window.electronAPI.loadData()
 *   const prog = await window.electronAPI.getProgression()
 *   const res  = await window.electronAPI.saveSession(session)
 */
contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * Charge le contenu de dataApp.json.
   * @returns {Promise<{ success: boolean, data?: { modules: object[], questions: object[], lexique: object[] }, error?: string }>}
   */
  loadData: () => ipcRenderer.invoke('load-data'),

  /**
   * Récupère la progression normalisée (niveau recalculé depuis xp_total).
   * @returns {Promise<object>} sessions, resultats_par_question, stats_par_sous_module, xp_total, niveau…
   */
  getProgression: () => ipcRenderer.invoke('get-progression'),

  /**
   * Envoie les réponses brutes d'une session terminée. Le score et l'XP sont calculés
   * côté main (shared/progression.js) ; un second envoi du même `id` ne crédite rien.
   * @param {object} session
   * @param {string} session.id - identifiant unique (UUID) généré au début de la session
   * @param {string} session.module_id
   * @param {number} session.duree_secondes
   * @param {{ questionId: string, selectedChoice: 'a'|'b'|'c'|'d' }[]} session.answers
   * @returns {Promise<{ success: boolean, session?: object, progression?: object, error?: string }>}
   */
  saveSession: (session) => ipcRenderer.invoke('save-session', session),
})
