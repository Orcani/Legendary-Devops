const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')
const os = require('node:os')
const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'devops-quiz-smoke-'))
const electron = require('electron')
const env = { ...process.env, DEVOPS_QUIZ_SMOKE: '1' }
delete env.ELECTRON_RUN_AS_NODE
for (const phase of ['first', 'restart', 'browser']) {
  const run = spawnSync(electron, [path.join(__dirname, 'electron-smoke.cjs'), profile, phase], {
    env, encoding: 'utf8', timeout: 90000, windowsHide: true,
  })
  if (run.stdout) process.stdout.write(run.stdout)
  // Avertissements non bloquants (captures d'écran ignorées), affichés même quand la phase réussit.
  if (run.status === 0 && run.stderr) for (const ligne of run.stderr.split(/\r?\n/)) if (ligne.includes('⚠')) console.warn(ligne)
  if (run.status !== 0) {
    if (run.stderr) process.stderr.write(run.stderr)
    console.error(run.error || 'Electron smoke failed, profile: ' + profile)
    process.exit(1)
  }
}
console.log('PASS: Electron complet, redémarrage réel et mode navigateur. Profil de test : ' + profile)
