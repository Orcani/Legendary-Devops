// Vérifie la version de Node.js avant `npm install` (script « preinstall »).
// Écrit en CommonJS simple pour fonctionner même avec une vieille version de Node.
var MINIMUM = [22, 12, 0]
var actuelle = process.versions.node.split('.').map(Number)
var assez = actuelle[0] !== MINIMUM[0] ? actuelle[0] > MINIMUM[0]
  : actuelle[1] !== MINIMUM[1] ? actuelle[1] > MINIMUM[1] : actuelle[2] >= MINIMUM[2]
if (!assez) {
  console.error('\n✖ Node.js ' + process.versions.node + ' est trop ancien pour Legendary DevOps.')
  console.error('  Electron 44 demande Node.js ' + MINIMUM.join('.') + ' ou plus récent (version LTS conseillée : 24 ou 26).')
  console.error('  Windows : winget install OpenJS.NodeJS.LTS   (ou https://nodejs.org)')
  console.error('  Puis fermez et rouvrez le terminal, vérifiez avec « node -v » et relancez « npm install ».\n')
  process.exit(1)
}
