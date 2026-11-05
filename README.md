# Legendary DevOps

Application de révision DevOps locale et hors ligne, en React et Electron, pensée pour être calme et sans pression (AuDHD-friendly). Le contenu est éditable dans `public/data/dataApp.json`.

## Prérequis

- **Node.js 22.12 ou plus récent** (LTS conseillée : 24 ou 26), exigé par Electron 44. Vérifier avec `node -v`.
- Sous Windows : `winget install OpenJS.NodeJS.LTS` (ou l'installateur de https://nodejs.org), puis fermer et rouvrir le terminal.
- `npm install` s'arrête avec un message clair si la version de Node est trop ancienne (`scripts/check-node.cjs`).

## Lancer

```powershell
npm install
npm run dev
```

Après une mise à jour de `package.json` (par exemple le passage à Electron 44), relancer `npm install` pour mettre à jour `node_modules` et `package-lock.json`.

La commande ouvre Electron. Le navigateur peut aussi utiliser l’URL Vite affichée dans le terminal.

## Parcours

- Trois onglets : **Accueil**, la page d'ouverture (niveau, prochain titre, vue d'ensemble, sous-modules à retravailler, progression par module, dernières sessions), **Modules** (modules regroupés par priorité P1/P2/P3, pour explorer) et **Codex**.
- Aucune série de jours ni compte à rebours : faire une pause ne fait rien perdre.
- La page d'un module explique ce qu'il couvre (champ `resume`), liste ses notions clés et donne le lien vers le cours.
- Les sous-modules forment un parcours numéroté. Chaque étape a son résumé, son statut (pas encore travaillé, à retravailler, en bonne voie, maîtrisé) et son propre QCM.
- « Réviser tout le module » propose une **révision rapide** (10 questions au hasard, si la sélection en compte plus de 10) ou **toutes les questions**. Le sélecteur « Déjà travaillés » limite aux sous-modules pratiqués.
- Pendant un QCM : choix mélangés et repérés A–D, score en direct dans la barre latérale.
- Une session interrompue est proposée à la reprise ; on peut aussi recommencer à zéro.
- Le bilan liste les erreurs avec la bonne réponse et permet de rejouer uniquement les erreurs.
- Le Codex présente les termes en cartes groupées par lettre, avec un index A–Z, une recherche insensible aux accents et des filtres par catégorie. Un clic ouvre la fiche complète en modale. Pendant un QCM, la même fiche s’ouvre en modale ; la réponse et le QCM restent en place.
- Le thème jour/nuit suit celui du système au premier lancement, se change avec le bouton discret en haut à droite et reste conservé après redémarrage.

## Progression

La progression est enregistrée à la fin du QCM. Le brouillon conserve les réponses en cours sur cet appareil et permet de reprendre le même QCM après navigation ou redémarrage.

Calcul partagé entre Electron et navigateur :
- Réponse correcte : 10 XP à la première tentative sur la question ; 5 XP aux suivantes.
- Réussite complète : bonus de 50 XP ; sinon, à partir de 80 % : 20 XP.
- Premier QCM terminé dans un module : bonus de 30 XP.
- Les compteurs par question et les taux par sous-module cumulent toutes les sessions.
- Un identifiant unique empêche un double crédit lors d’un double clic ou d’un nouvel envoi.
- Le bilan confirme la sauvegarde uniquement après sa réussite ; un échec permet de réessayer.

Electron utilise `progression.json` dans `%APPDATA%\legendary-devops` (Windows) ou `~/Library/Application Support/legendary-devops` (macOS). Au premier lancement, la progression de l'ancien dossier `devops-quiz` y est copiée automatiquement (l'ancien fichier est conservé). Le navigateur utilise `localStorage`. Ces deux historiques restent propres à leur environnement. Le thème et les brouillons utilisent également `localStorage`.

## Vérifier

```powershell
npm test
npm run lint
npm run build            # vérifie d'abord dataApp.json (npm run validate-data)
npm run test:electron
```

Le dernier test utilise des fenêtres masquées et un profil temporaire distinct de votre progression. Il teste le parcours réel, ferme puis relance Electron, et teste aussi le chemin navigateur sans preload. Les captures sont enregistrées dans `.test-artifacts`.

## Modifier le contenu

Après chaque modification de `public/data/dataApp.json` :

```powershell
npm run validate-data
```

Le script signale les **erreurs** qui casseraient l'application (moins de 4 choix, référence inconnue, champ obligatoire manquant…) et les **avertissements** pour ce qui reste à compléter (module sans question, fiche « voir aussi » pas encore rédigée). `npm run build` refuse de construire si une erreur subsiste.

Le contenu actuel comprend 3 modules, 3 questions et 6 fiches Codex.

Pour ajouter un module, renseigner aussi `resume` (2-3 phrases) pour le module et chacun de ses sous-modules, et vérifier que la valeur de `icon` existe dans `src/components/shared/ModuleIcon.jsx`.

## Distribuer l'application

```powershell
npm run dist:win     # sur Windows : release/Legendary-DevOps-Setup-<version>.exe
npm run dist:mac     # sur un Mac uniquement : release/Legendary-DevOps-<version>-<arch>.dmg
```

- L'installateur Windows laisse choisir le dossier d'installation et crée un raccourci « Legendary DevOps ».
- Après installation, le contenu reste modifiable : `resources/data/dataApp.json` dans le dossier d'installation (Windows) ou `Legendary DevOps.app/Contents/Resources/data/dataApp.json` (macOS).
- Les installateurs ne sont pas encore signés : au premier lancement, Windows SmartScreen affiche « Windows a protégé votre ordinateur » (cliquer sur « Informations complémentaires » puis « Exécuter quand même ») et macOS demande d'ouvrir l'application par clic droit > Ouvrir.

## Enregistrer dans Git

Le dépôt Git est le dossier du projet côté Windows, mais Git s'utilise **depuis WSL** (clé SSH configurée dans WSL). Le code se lance toujours dans PowerShell (`npm run dev`, `npm run build`…).

```bash
cd /mnt/c/Users/delph/.gemini/antigravity/scratch/devops-quiz
git add -A
git commit -m "Ce qui a changé"
git push
```

`node_modules`, `dist`, `dist-electron`, `release` et `.test-artifacts` sont ignorés (`.gitignore`). Les fins de ligne sont enregistrées au format LF (`.gitattributes`). Le dépôt a `core.fileMode false` : sous `/mnt/c`, tous les fichiers paraissent exécutables, ce réglage évite de faux changements.
