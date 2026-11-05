import electron from 'electron'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import fs from 'node:fs'
import Store from 'electron-store'
import { enregistrerSession, normaliserProgression } from '../shared/progression.js'
const { app, BrowserWindow, ipcMain, shell, nativeTheme } = electron
const dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Dossier de données fixe, indépendant du nom affiché de l'application :
 *   Windows : %APPDATA%/legendary-devops   ·   macOS : ~/Library/Application Support/legendary-devops
 * Au premier lancement, la progression de l'ancien dossier « devops-quiz » est copiée (l'original est conservé).
 * Ignoré par le test Electron, qui fournit son propre profil.
 */
function configurerDossierDonnees() {
  if (process.env.DEVOPS_QUIZ_SMOKE === '1') return
  const appData = app.getPath('appData')
  const dossier = path.join(appData, 'legendary-devops')
  app.setPath('userData', dossier)
  const cible = path.join(dossier, 'progression.json')
  const ancien = path.join(appData, 'devops-quiz', 'progression.json')
  try {
    if (!fs.existsSync(cible) && fs.existsSync(ancien)) {
      fs.mkdirSync(dossier, { recursive: true })
      fs.copyFileSync(ancien, cible)
    }
  } catch (e) { console.error('Migration de la progression impossible :', e.message) }
}
configurerDossierDonnees()
const store = new Store({ name: 'progression', defaults: normaliserProgression() })

function readData() {
  // Version packagée : resources/data/dataApp.json, hors de l'archive, donc modifiable avec un éditeur de texte.
  const dataPath = app.isPackaged
    ? path.join(process.resourcesPath, 'data', 'dataApp.json')
    : path.join(dirname, '../public/data/dataApp.json')
  return JSON.parse(fs.readFileSync(dataPath, 'utf8').replace(/^\uFEFF/, ''))
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 800, minWidth: 900, minHeight: 600,
    title: 'Legendary DevOps',
    // Logo de la fenêtre et de la barre des tâches (l'exécutable packagé a déjà le sien via electron-builder).
    icon: path.join(dirname, process.env.VITE_DEV_SERVER_URL ? '../public/icon.png' : '../dist/icon.png'),
    show: process.env.DEVOPS_QUIZ_SMOKE !== '1',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#121633' : '#FAFAFD',
    webPreferences: { preload: path.join(dirname, 'preload.cjs'), contextIsolation: true, nodeIntegration: false, sandbox: true },
  })
  // Liens externes (cours) : navigateur du système, jamais une fenêtre Electron.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) void shell.openExternal(url)
    return { action: 'deny' }
  })
  // Aucune navigation hors de l'application dans la fenêtre principale.
  const origineApp = process.env.VITE_DEV_SERVER_URL || pathToFileURL(path.join(dirname, '../dist/')).href
  win.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith(origineApp)) return
    event.preventDefault()
    if (/^https?:\/\//.test(url)) void shell.openExternal(url)
  })
  if (process.env.VITE_DEV_SERVER_URL) win.loadURL(process.env.VITE_DEV_SERVER_URL)
  else win.loadFile(path.join(dirname, '../dist/index.html'))
}

ipcMain.handle('load-data', () => {
  try { return { success: true, data: readData() } }
  catch (e) { return { success: false, error: e.message } }
})
ipcMain.handle('get-progression', () => normaliserProgression(store.store))
ipcMain.handle('save-session', (_, session) => {
  try {
    const result = enregistrerSession(store.store, session, readData().questions)
    // Une seule écriture du document entier, après validation et calcul.
    store.store = result.progression
    return { success: true, ...result }
  } catch (e) { return { success: false, error: e.message } }
})
app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow() })
})
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
