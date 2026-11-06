const { app, BrowserWindow } = require('electron')
const path = require('node:path')
const fs = require('node:fs')
const http = require('node:http')
const assert = require('node:assert/strict')
const { pathToFileURL } = require('node:url')
const profile = process.argv[2],
  phase = process.argv[3]
app.setPath('userData', profile)
const pause = ms => new Promise(resolve => setTimeout(resolve, ms))
let win
const run = async source => {
  const result = await win.webContents.executeJavaScript(
    `(async () => { try { return { ok: true, value: await (${source}) } } catch (e) { return { ok: false, error: e.stack } } })()`,
    true,
  )
  if (!result.ok) throw new Error(result.error)
  return result.value
}
async function until(source) {
  for (let i = 0; i < 150; i++) {
    if (await run(source)) return
    await pause(100)
  }
  throw new Error('Attente expirée : ' + source + '\n' + (await run('document.body.innerText')))
}
// Capture d'écran pour garder une trace visuelle. Elle ne vérifie rien : un échec n'arrête pas le test.
// (Avec Electron récent, capturer une fenêtre jamais affichée peut lever « UnknownVizError ».)
async function capture(name) {
  const dir = path.resolve(__dirname, '../.test-artifacts')
  fs.mkdirSync(dir, { recursive: true })
  await pause(200)
  try {
    const image = await win.webContents.capturePage(undefined, { stayHidden: true })
    if (image.isEmpty()) throw new Error('image vide')
    fs.writeFileSync(path.join(dir, name + '.png'), image.toPNG())
  } catch (e) {
    console.warn('⚠ Capture « ' + name + ' » ignorée : ' + (e.message || e))
  }
}
const click = text =>
  run(
    `(() => { const el = [...document.querySelectorAll('button,a')].find(e => e.textContent.includes(${JSON.stringify(text)})); if (!el) throw new Error('Bouton absent'); el.click(); })()`,
  )
async function correct() {
  // Attendre que le titre affiché soit bien une question (et pas un titre du bilan précédent).
  await until(`(async () => {
    const data = ${phase === 'browser' ? "await (await fetch('/data/dataApp.json')).json()" : '(await window.electronAPI.loadData()).data'};
    const h2 = document.querySelector('main h2');
    return !!h2 && data.questions.some(q => q.enonce === h2.textContent);
  })()`)
  await run(`(async () => {
    const data = ${phase === 'browser' ? "await (await fetch('/data/dataApp.json')).json()" : '(await window.electronAPI.loadData()).data'};
    const title = document.querySelector('main h2').textContent;
    const q = data.questions.find(q => q.enonce === title);
    if (!q) throw new Error('Question introuvable ' + title);
    const text = q.choix.find(c => c.id === q.reponse_correcte).texte;
    [...document.querySelectorAll('main button')].find(b => b.querySelector('[data-choice-text]')?.textContent === text).click();
  })()`)
  await until("!!document.querySelector('[data-testid=feedback-correct]')")
}
// Lance le QCM « Session complète » du module Linux. Renvoie true si une session en cours a été proposée puis reprise.
async function start() {
  await run("location.hash = '#/module/linux-fondamentaux'")
  await until("document.body.innerText.includes('Réviser tout le module')")
  await click('Session complète')
  await until("!!document.querySelector('main h2') || !!document.querySelector('[data-testid=resume-prompt]')")
  const reprise = await run("!!document.querySelector('[data-testid=resume-prompt]')")
  if (reprise) {
    await click('Reprendre la session')
    await until("!!document.querySelector('main h2')")
  }
  return reprise
}
// Ouvre Mon parcours ; au premier lancement, passe d'abord par l'écran « Par où commencer ? ».
async function ouvrirMonParcours() {
  await until("!!document.querySelector('[data-testid=overview]') || !!document.querySelector('[data-testid=welcome]')")
  if (await run("!!document.querySelector('[data-testid=welcome]')")) {
    await click('Voir Mon parcours')
    await until("!!document.querySelector('[data-testid=overview]')")
  }
}
async function complete() {
  await correct()
  await click('Question suivante')
  await until("document.querySelector('aside').innerText.includes('2 / 2')")
  await correct()
  await run(
    "(() => { const b = [...document.querySelectorAll('button')].find(b => b.textContent.includes('Terminer la session')); b.click(); b.click() })()",
  )
  await until("!!document.querySelector('[data-testid=quiz-summary]')")
}
async function main() {
  await app.whenReady()
  if (phase === 'browser') {
    // Même UI sans preload : chemin localStorage et fetch HTTP.
    const root = path.resolve(__dirname, '../dist')
    const server = http.createServer((req, res) => {
      const relative = decodeURIComponent(req.url.split('?')[0])
      // Même jeu de données figé que la version Electron.
      const file =
        relative === '/data/dataApp.json' && process.env.DEVOPS_QUIZ_DATA
          ? process.env.DEVOPS_QUIZ_DATA
          : path.resolve(root, '.' + (relative === '/' ? '/index.html' : relative))
      if ((file !== process.env.DEVOPS_QUIZ_DATA && !file.startsWith(root + path.sep)) || !fs.existsSync(file)) {
        res.writeHead(404)
        res.end()
        return
      }
      const ext = path.extname(file)
      res.setHeader(
        'Content-Type',
        ext === '.js'
          ? 'text/javascript'
          : ext === '.css'
            ? 'text/css'
            : ext === '.json'
              ? 'application/json'
              : 'text/html',
      )
      res.end(fs.readFileSync(file))
    })
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
    win = new BrowserWindow({ show: false, webPreferences: { contextIsolation: true, nodeIntegration: false } })
    await win.loadURL('http://127.0.0.1:' + server.address().port)
    await ouvrirMonParcours()
    assert.equal(await run('typeof window.electronAPI'), 'undefined')
    // Étape « Comprendre » : contenu affiché, étape marquée comme lue, passage au QCM de l'étape.
    await run("location.hash = '#/module/linux-fondamentaux/comprendre/linux-arborescence'")
    await until("!!document.querySelector('[data-testid=learn]')")
    assert.equal(
      await run("JSON.parse(localStorage.getItem('devops-quiz-comprendre-vus')).includes('linux-arborescence')"),
      true,
    )
    await run("document.querySelector('[data-testid=learn-practice]').click()")
    await until("location.hash.includes('submodule=linux-arborescence')")
    await run("location.hash = '#/module/linux-fondamentaux'")
    await until("!!document.querySelector('[data-testid=scope-seen]')")
    // Aucun sous-module travaillé : le filtre « Déjà travaillés » est indisponible.
    assert.equal(await run("document.querySelector('[data-testid=scope-seen]').disabled"), true)
    assert.equal(await run("!!document.querySelector('a[href*=scope]')"), true)
    // 2 questions seulement : pas de révision rapide (réservée aux sélections de plus de 10 questions).
    assert.equal(await run('!!document.querySelector(\'a[href*="mode=short"]\')'), false)
    await run("document.querySelector('[data-testid=reviser-linux-arborescence]').click()")
    await until("location.hash.includes('submodule=linux-arborescence')")
    await until("!!document.querySelector('main h2')")
    await start()
    await run(
      "(() => { window.originalSetItem = Storage.prototype.setItem; Storage.prototype.setItem = function(k,v) { if(k === 'devops-quiz-progression') throw new Error('Disque plein simulé'); return window.originalSetItem.call(this,k,v) } })()",
    )
    await correct()
    await click('Question suivante')
    await until("document.querySelector('aside').innerText.includes('2 / 2')")
    await correct()
    await click('Terminer la session')
    await until("document.body.innerText.includes('Échec de sauvegarde')")
    assert.equal(await run("!!document.querySelector('[data-testid=quiz-summary]')"), false)
    await run('void (Storage.prototype.setItem = window.originalSetItem)')
    await click('Réessayer la sauvegarde')
    await until("!!document.querySelector('[data-testid=quiz-summary]')")
    assert.equal(await run("JSON.parse(localStorage.getItem('devops-quiz-progression')).xp_total"), 100)
    // Le total d'XP est affiché sur l'accueil (l'onglet Modules ne montre que les modules).
    await run("location.hash = '#/'")
    await until("!!document.querySelector('[data-testid=total-xp]')")
    await new Promise(resolve => {
      win.webContents.once('did-finish-load', resolve)
      win.reload()
    })
    await until("!!document.querySelector('[data-testid=total-xp]')")
    assert.equal(await run("document.querySelector('[data-testid=total-xp]').textContent"), '100 XP')
    assert.equal(await run("!!document.querySelector('[data-testid=next-step] a')"), true)
    await start()
    await complete()
    assert.equal(
      await run(
        "JSON.parse(localStorage.getItem('devops-quiz-progression')).resultats_par_question['q-linux-001'].tentatives",
      ),
      2,
    )
    console.log('PASS navigateur : session, rechargement, cumul des tentatives et XP')
    server.close()
    return
  }
  await import(pathToFileURL(path.resolve(__dirname, '../dist-electron/main.js')).href)
  for (let i = 0; i < 100; i++) {
    win = BrowserWindow.getAllWindows()[0]
    if (win) break
    await pause(100)
  }
  win.webContents.setBackgroundThrottling(false)
  const errors = []
  win.webContents.on('console-message', (_, level, message) => {
    if (level === 3) errors.push(message)
  })
  await ouvrirMonParcours()
  assert.equal(await run('typeof window.electronAPI.saveSession'), 'function')
  if (phase === 'first') {
    await capture('accueil')
    // Page « Mon objectif » (D-52) : jauge des bases, barre et choix du poste.
    await click('Mon objectif')
    await until(
      "!!document.querySelector('[data-testid=score-poste]') && !!document.querySelector('[data-testid=jauge-bases]')",
    )
    await click('Stage SRE')
    await until("document.querySelector('main').innerText.includes('Prometheus')")
    await capture('objectif')
    await start()
    await correct()
    const hash = await run('location.hash')
    await run("document.querySelector('[data-codex-id=fhs]').click()")
    await until("!!document.querySelector('[role=dialog]')")
    // Le bouton porte le nom du terme tel qu'écrit dans dataApp.json (pas son id).
    const termeFhs = (await run('window.electronAPI.loadData()')).data.lexique.find(e => e.id === 'fhs').terme
    assert.equal(await run("document.querySelector('[data-codex-id=fhs]').textContent"), termeFhs)
    await capture('codex-dark')
    assert.equal(await run('location.hash'), hash)
    await click('Reprendre le QCM')
    await until("!document.querySelector('[role=dialog]')")
    assert.equal(await run("document.querySelectorAll('main button[disabled]').length"), 4)
    // Le thème par défaut suit le système : on passe d'abord en mode nuit si besoin.
    if (!(await run("document.documentElement.classList.contains('dark')"))) {
      await click('Mode nuit')
      await until("document.documentElement.classList.contains('dark')")
    }
    await click('Mode jour')
    await until("!document.documentElement.classList.contains('dark')")
    assert.equal(await run("getComputedStyle(document.querySelector('main h2')).color"), 'rgb(27, 32, 72)')
    await capture('quiz-light-' + phase)
    await click('Question suivante')
    await until("document.querySelector('aside').innerText.includes('2 / 2')")
    await correct()
    await click('Terminer la session')
    await until("!!document.querySelector('[data-testid=quiz-summary]')")
    await capture('bilan-light')
    let prog = await run('window.electronAPI.getProgression()')
    assert.equal(prog.xp_total, 100)
    assert.equal(prog.sessions.length, 1)
    const duplicate = await run('window.electronAPI.saveSession(' + JSON.stringify({ id: prog.sessions[0].id }) + ')')
    assert.equal(duplicate.progression.xp_total, 100)
    const invalid = await run(
      "window.electronAPI.saveSession({id:'invalid',module_id:'linux-fondamentaux',answers:[{questionId:'unknown',selectedChoice:'a'}]})",
    )
    assert.equal(invalid.success, false)
    await click('Rejouer ce QCM')
    await complete()
    prog = await run('window.electronAPI.getProgression()')
    assert.equal(prog.xp_total, 160)
    assert.equal(prog.sessions.length, 2)
    assert.equal(prog.resultats_par_question['q-linux-001'].tentatives, 2)
    // Un brouillon non terminé doit lui aussi survivre à la fermeture du processus.
    await click('Rejouer ce QCM')
    await correct()
    await pause(300)
    win.webContents.session.flushStorageData()
    console.log('PASS Electron : Codex sans sortie, bilan, thème, 100 puis 60 XP, doublons et validation')
  } else {
    const prog = await run('window.electronAPI.getProgression()')
    assert.equal(prog.xp_total, 160)
    assert.equal(prog.sessions.length, 2)
    assert.equal(await run("document.documentElement.classList.contains('dark')"), false)
    // Le brouillon commencé avant la fermeture est proposé à la reprise, pas repris en silence.
    assert.equal(await start(), true)
    await until("!!document.querySelector('[data-testid=feedback-correct]')")
    assert.equal(await run("document.querySelectorAll('main button[disabled]').length"), 4)
    await capture('quiz-light-' + phase)
    await click('Question suivante')
    await until("document.querySelector('aside').innerText.includes('2 / 2')")
    await correct()
    await click('Terminer la session')
    await until("!!document.querySelector('[data-testid=quiz-summary]')")
    assert.equal((await run('window.electronAPI.getProgression()')).xp_total, 220)
    console.log('PASS redémarrage : progression, thème et réponse du brouillon conservés')
  }
  assert.deepEqual(errors, [])
}
main()
  .then(() => app.exit(0))
  .catch(e => {
    console.error('✖ Phase « ' + phase + ' » : ' + (e.stack || e))
    app.exit(1)
  })
