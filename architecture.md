# ARCHITECTURE.md — Legendary DevOps

> **Rôle de ce fichier :** document de référence unique du projet. À fournir en contexte au début de chaque session de développement. Toute décision qui s'écarte de ce document doit y être reportée (section 13) **dans le même lot de modifications que le code**.

| | |
|---|---|
| **Dernière mise à jour** | 2026-11-05 |
| **État** | Phases 0 à 4 terminées côté code · reste à tester les installateurs sur Windows et macOS · prochaine étape : Phase 5 (contenu) |
| **Version précédente** | `architecture.v1.md` (archive, ne plus utiliser) |

---

## 1. Vision

### Public cible
Étudiant en reconversion ou en formation initiale qui prépare un **stage ou une première expérience professionnelle en DevOps**.

### But
Un outil de **révision active et ludique** qui couvre les grandes thématiques DevOps, organisées par **priorité de candidature**, en s'appuyant sur le programme de Stéphane Robert. Objectif final du joueur : atteindre le titre **« Légende du DevOps »**.

### Principes produit
1. **Priorité d'abord** : l'interface pousse vers les sujets P1 (à maîtriser avant toute candidature) avant les P2/P3.
2. **Feedback immédiat** : chaque réponse est corrigée et expliquée tout de suite, avec un lien vers la fiche Codex.
3. **Révision ciblée** : l'application repère les points faibles et propose de les retravailler.
4. **Zéro friction** : aucune connexion, aucun compte, une session interrompue se reprend quand on veut.
5. **AuDHD-friendly** : une interface calme, prévisible et sans pression (détails ci-dessous).

### Conception AuDHD-friendly
L'application doit convenir aux personnes autistes et/ou TDAH. Ces règles priment sur les mécaniques de « gamification » habituelles.

| Règle | Concrètement |
|---|---|
| **Aucune pression de régularité** | Pas de série de jours (*streak*), pas de rappel culpabilisant, pas de perte de progression après une pause. La progression ne fait que monter (D-22) |
| **Pas de chronomètre visible** | La durée n'est jamais décomptée pendant un QCM ; elle n'apparaît qu'au bilan, à titre informatif. Les durées estimées (« environ 5 min ») aident à planifier |
| **Chiffres sur demande** | Les statistiques sont sur une page dédiée ; l'écran des modules sert à explorer, sans chiffres envahissants (D-23) |
| **Une action principale par écran** | Un seul bouton bleu plein par zone ; les actions secondaires sont en contour ; le thème est discret et séparé de la navigation (D-24) |
| **Prévisibilité** | Mêmes en-têtes et onglets sur les trois écrans principaux ; boutons qui disent exactement ce qu'ils font ; aucune reprise ou navigation surprise |
| **Erreurs bienveillantes** | Feedback neutre (« Oups, ce n'est pas ça. ») suivi d'une explication ; « À retravailler » plutôt que « échec » |
| **Repères visuels** | Couleur et icône par module, lettres A–Z dans le Codex, parcours numérotés : se situer sans tout lire |
| **Calme sensoriel** | Peu d'animations, aucune en boucle ; `prefers-reduced-motion` respecté ; contraste ≥ 4,5:1 ; thème jour/nuit |

### Contraintes fondamentales

| Contrainte | Détail |
|---|---|
| ❌ Aucun backend | Pas de serveur, pas d'API, pas de base de données distante |
| ✅ Exécution 100 % locale | L'application tourne entièrement sur la machine de l'utilisateur |
| ✅ Contenu modifiable sans code | Questions et fiches Codex éditables dans `public/data/dataApp.json` |
| ✅ Multi-plateforme | `.exe` (Windows) et `.dmg` (macOS) via electron-builder |
| ✅ Hors-ligne total | Aucune requête réseau nécessaire (polices Lexend et JetBrains Mono embarquées via `@fontsource`) |

---

## 2. Vocabulaire du projet

| Terme | Définition |
|---|---|
| **Module** | Grande thématique (ex. `linux-fondamentaux`), avec une priorité P1/P2/P3 |
| **Sous-module** | Découpage d'un module (ex. `linux-droits`), unité de mesure des points faibles |
| **QCM court** | Jusqu'à 10 questions tirées au hasard dans la sélection |
| **QCM long** | Toutes les questions de la sélection |
| **Session** | Un QCM terminé et sauvegardé ; c'est elle qui rapporte de l'XP |
| **Brouillon** | Session en cours, conservée localement pour reprise après fermeture |
| **Bilan** | Écran de fin de session (score, XP gagnés) |
| **Codex** | Dictionnaire des termes techniques. **Remplace l'ancien nom « Lexique »** dans toute l'interface. Les clés JSON `lexique` et `termes_lexique` sont conservées pour ne pas casser le contenu existant |

---

## 3. Stack technique

```
┌──────────────────────────────────────────────────────────────┐
│ PRÉSENTATION  React 18 · React Router 6 (HashRouter)         │
│               Tailwind CSS 3.4 · Framer Motion · Lucide      │
├──────────────────────────────────────────────────────────────┤
│ ÉTAT          Zustand 5 (store unique : statsStore)          │
├──────────────────────────────────────────────────────────────┤
│ LOGIQUE       shared/progression.js  (partagé main/renderer) │
├──────────────────────────────────────────────────────────────┤
│ DONNÉES       Contenu : public/data/dataApp.json (lecture)   │
│               Progression : electron-store (progression.json)│
│               UI : localStorage (thème, brouillons)          │
├──────────────────────────────────────────────────────────────┤
│ DESKTOP       Electron · Vite 5 · vite-plugin-electron       │
│               electron-builder (packaging)                   │
└──────────────────────────────────────────────────────────────┘
```

### Versions effectives (source : `package.json`)

| Librairie | Version | Rôle | Note |
|---|---|---|---|
| `react` / `react-dom` | 18.3 | UI déclarative | |
| `react-router-dom` | 6.30 | Navigation | `HashRouter` : compatible `file://` d'Electron |
| `tailwindcss` | **3.4** | Styling utility-first | Voir décision D-01 |
| `postcss` + `autoprefixer` | 8.x / 10.x | Pipeline CSS de Tailwind 3 | |
| `framer-motion` | 14.x | Animations (feedback, astuce, bilan) | |
| `lucide-react` | 1.x | Icônes SVG | |
| `zustand` | **5.0** | Store global | Lecture via sélecteurs (`useShallow`) |
| `@fontsource-variable/lexend` · `@fontsource/jetbrains-mono` | 5.x | Polices embarquées (Lexend pour le texte) | Hors ligne |
| `electron` | **44.x** | Shell desktop | Version supportée (D-26). Electron ne maintient que les 3 dernières versions majeures : à remonter environ tous les 6 mois |
| `electron-store` | **8.1** | Persistance JSON locale | Seule dépendance chargée à l'exécution (D-29) ; v10 est ESM-only (D-02) |
| `vite` | 5.4 | Bundler | |
| `vite-plugin-electron` | 0.28 | Build main + preload | Preload sorti en CommonJS (`preload.cjs`) |
| `electron-builder` | 26.x | Installateurs `.exe` (NSIS) et `.dmg` | Configuré dans `package.json > build` |

**Prérequis de développement : Node.js ≥ 22.12** (LTS conseillée 24 ou 26), imposé par Electron 44 et son installateur (`@electron/get` 5, ESM). Fixé dans `package.json > engines` et `.nvmrc` ; `npm install` lance d'abord `scripts/check-node.cjs`, qui s'arrête avec un message en français si la version est trop ancienne (D-30).

Toutes les librairies d'interface sont en `devDependencies` : Vite les intègre au build, elles n'ont pas besoin d'être copiées dans l'application packagée.

---

## 4. Arborescence

```
devops-quiz/
├── architecture.md            ← ce fichier
├── README.md                  ← lancement, parcours, vérifications, distribution
├── index.html                 ← <title>Legendary DevOps</title>, lang="fr" (CSP ajoutée au build)
├── vite.config.js             ← plugins React, Electron et CSP de production
├── build/icon.png             ← icône 1024 × 1024 (convertie en .ico / .icns par electron-builder)
├── release/                   ← installateurs générés (ignoré par git)
├── electron/
│   ├── main.js                ← fenêtre (sandbox), IPC, electron-store, dossier de données, garde de navigation
│   └── preload.js             ← bridge contextBridge → window.electronAPI
├── shared/
│   └── progression.js         ← calcul XP / niveaux / stats (main ET navigateur)
├── public/
│   ├── data/dataApp.json      ← tout le contenu éditable
│   ├── icon.svg               ← logo (favicon, en-tête de l'application)
│   └── icon.png               ← logo 512 px (fenêtre et barre des tâches Electron)
├── scripts/
│   ├── check-node.cjs         ← vérifie Node ≥ 22.12 avant npm install
│   ├── validate-data.mjs      ← vérification de dataApp.json (lancée par npm run build)
│   ├── progression.test.js    ← tests unitaires (node --test)
│   ├── electron-smoke.cjs     ← parcours réel Electron + navigateur
│   └── run-electron-smoke.cjs
└── src/
    ├── main.jsx               ← HashRouter, polices, StrictMode
    ├── App.jsx                ← chargement données/progression, thème, routes
    ├── index.css              ← Tailwind + classes de composants (.panel, .button-*)
    ├── store/statsStore.js    ← store Zustand (contenu, progression, thème)
    ├── hooks/useQuiz.js       ← machine à états d'une session (brouillon, sauvegarde)
    ├── lib/
    │   ├── quizSelection.js   ← filtrage du pool, tirage aléatoire
    │   ├── priorites.js       ← classes CSS des badges P1/P2/P3
    │   ├── stats.js           ← statuts, taux, points faibles, vue d'ensemble
    │   ├── format.js          ← pluriels, durées, libellés, recherche sans accents, contraste
    │   └── brouillons.js      ← purge des brouillons de session
    ├── views/
    │   ├── AccueilView.jsx    ← /              (progression, points à revoir, sessions)
    │   ├── ModulesView.jsx    ← /modules       (modules par priorité)
    │   ├── CodexView.jsx      ← /codex
    │   ├── ModuleView.jsx     ← /module/:moduleId
    │   └── QuizView.jsx       ← /quiz/:moduleId
    ├── components/shared/
    │   ├── AppHeader.jsx      ← marque, onglets Accueil / Modules / Codex, titre
    │   ├── ThemeToggle.jsx    ← bouton jour/nuit (variante discrète, icône seule)
    │   └── ModuleIcon.jsx     ← tuile icône + couleur du module
    ├── components/dashboard/
    │   └── ModuleCard.jsx
    ├── components/stats/
    │   ├── LevelCard.jsx · OverviewCard.jsx
    │   ├── WeakPointsPanel.jsx ← sous-modules < 70 %
    │   ├── ModuleProgressList.jsx · RecentSessions.jsx
    ├── components/codex/
    │   ├── CodexCard.jsx      ← fiche complète d'un terme
    │   └── CodexModal.jsx     ← fiche en modale (page Codex et QCM), historique « Retour à… »
    └── components/quiz/
        ├── SidebarQuiz.jsx · TipPanel.jsx
        ├── QuestionCard.jsx · AnswerChoice.jsx · FeedbackPanel.jsx
        └── QuizSummary.jsx    ← bilan
```

---

## 5. Flux de données et persistance

```
 React (renderer)                preload.js                 main.js (Node)
 ────────────────                ──────────                 ──────────────
 statsStore.loadData()      →  electronAPI.loadData()   →  'load-data'        → lit dataApp.json
 statsStore.loadProgression →  electronAPI.getProgression → 'get-progression' → electron-store
 useQuiz.finishSession()    →  electronAPI.saveSession  →  'save-session'     → enregistrerSession()
                                                                               → écrit progression.json
```

**Règle clé : le score et l'XP sont calculés côté main**, à partir des réponses brutes, par `shared/progression.js`. Le renderer n'envoie jamais de score ni d'XP. Chaque session porte un `id` (UUID) généré au démarrage : un second envoi du même `id` ne crédite rien.

**Mode navigateur** (`npm run dev` ouvert dans un navigateur, sans preload) : même calcul, contenu chargé via `fetch`, progression dans `localStorage`. Les deux historiques sont indépendants.

### Canaux IPC

| Canal | Entrée | Sortie |
|---|---|---|
| `load-data` | — | `{ success, data?, error? }` |
| `get-progression` | — | objet Progression normalisé (§ 6.4) |
| `save-session` | `{ id, module_id, duree_secondes, answers: [{ questionId, selectedChoice }] }` | `{ success, session?, progression?, error? }` |

### Où sont stockées les données

| Donnée | Emplacement | Géré par |
|---|---|---|
| Contenu | `public/data/dataApp.json` (dev) · `resources/data/dataApp.json` (packagé) | Édition manuelle |
| Progression | `%APPDATA%/legendary-devops/progression.json` · `~/Library/Application Support/legendary-devops/progression.json` | electron-store, jamais à la main |
| Thème | `localStorage['devops-quiz-theme']` (clé unique) | statsStore |
| Brouillons | `localStorage['devops-quiz-draft:<module>:<sous-module>:<scope>:<mode>']` : tirage, **ordre mélangé des choix**, réponses | useQuiz ; purgés au démarrage s'ils ont plus de 30 jours ou visent une question supprimée |

> Le dossier `legendary-devops` est fixé dans `main.js` (`app.setPath('userData', …)`), indépendamment du nom affiché. Au premier lancement, si `progression.json` n'existe pas encore, celui de l'ancien dossier `devops-quiz` est **copié** (l'original reste en place comme sauvegarde) (D-27). Le test Electron fournit son propre profil et ignore ce mécanisme.

### Sécurité Electron
- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` ; le preload n'utilise que `contextBridge` et `ipcRenderer`.
- **CSP** ajoutée à `index.html` au build seulement (`default-src 'self'`, `script-src 'self'`, `style-src 'self' 'unsafe-inline'`, `img-src`/`font-src 'self' data:`, `connect-src 'self'`, `object-src 'none'`). En développement, Vite a besoin de scripts en ligne (D-28).
- Liens externes (`target="_blank"`) ouverts dans le navigateur du système ; toute navigation hors de l'application est bloquée (`will-navigate`).

---

## 6. Modèle de données

### 6.1 Racine de `dataApp.json`

```json
{ "modules": [ ... ], "questions": [ ... ], "lexique": [ ... ] }
```

### 6.2 Objet `Module`

```json
{
  "id": "conteneurs-fondamentaux",
  "label": "Conteneurs — Fondamentaux",
  "description": "Virtualisation vs conteneurisation, images, Dockerfile, volumes, réseaux, Compose",
  "resume": "Docker emballe une application avec tout ce dont elle a besoin… (2 à 3 phrases)",
  "icon": "container",
  "couleur": "#2496ED",
  "priorite": "P1",
  "lien_cours": "https://www.stephane-robert.info/docs/conteneurs/moteurs-conteneurs/docker/",
  "concepts_cles": ["images", "Dockerfile", "volumes", "Docker Compose"],
  "sous_modules": [
    { "id": "conteneurs-bases", "label": "Fondamentaux (image, run, ps)",
      "resume": "Les commandes du quotidien : docker run, docker ps… (2 à 3 phrases)", "priorite": "P1" },
    { "id": "conteneurs-compose", "label": "Docker Compose", "resume": "…", "priorite": "P2" }
  ]
}
```

| Champ | Type | Oblig. | Utilisé par |
|---|---|---|---|
| `id` | string kebab-case | ✅ | partout |
| `label` | string | ✅ | Dashboard, ModuleView, sidebar |
| `description` | string | ✅ | Carte du Dashboard (liste courte de notions) |
| `resume` | string (2-3 phrases) | ✅ | En-tête de ModuleView : ce que le module apporte, en langage clair. Repli sur `description` si absent |
| `icon` | nom d'icône Lucide | ✅ | Tuile du Dashboard et de ModuleView. **Doit figurer dans la table de `ModuleIcon.jsx`** (sinon icône livre) |
| `couleur` | hex | ✅ | Liseré et tuile d'icône (texte noir ou blanc choisi automatiquement) |
| `priorite` | `"P1"` \| `"P2"` \| `"P3"` | ✅ | Badge + phrase d'explication |
| `lien_cours` | URL | ✅ | Lien « Ouvrir le cours » (navigateur du système) |
| `concepts_cles` | string[] | ✅ | Étiquettes de ModuleView |
| `sous_modules[].resume` | string (2-3 phrases) | ✅ | Carte de l'étape dans le parcours |
| `sous_modules[].priorite` | P1/P2/P3 | ⬜ | Hérite du module si absent ; badge affiché seulement si les priorités sont mélangées |

Icônes disponibles dans `ModuleIcon.jsx` : `activity`, `book-open`, `boxes`, `cloud`, `code`, `container`, `file-code`, `gauge`, `git-branch`, `layers`, `network`, `server`, `shield-check`, `terminal`, `workflow`, `wrench`.

### 6.3 Objet `Question`

> ⚠️ **Exactement 4 choix**, ids `a`, `b`, `c`, `d`. L'`astuce` est optionnelle et ne s'affiche que sur clic.

```json
{
  "id": "q-conteneurs-001",
  "module_id": "conteneurs-fondamentaux",
  "sous_module_id": "conteneurs-bases",
  "difficulte": "intermediaire",
  "enonce": "Quelle commande liste tous les conteneurs, y compris arrêtés ?",
  "astuce": "Le flag '-a' signifie 'all' dans la plupart des commandes Docker.",
  "choix": [
    { "id": "a", "texte": "docker ps" },
    { "id": "b", "texte": "docker ps -a" },
    { "id": "c", "texte": "docker list --all" },
    { "id": "d", "texte": "docker container show" }
  ],
  "reponse_correcte": "b",
  "explication_correcte": "docker ps -a affiche tous les conteneurs, quel que soit leur état.",
  "explication_erreur": "docker ps sans flag n'affiche que les conteneurs actifs.",
  "termes_lexique": ["conteneur", "docker-ps"]
}
```

| Champ | Type | Oblig. | Description |
|---|---|---|---|
| `id` | string | ✅ | `q-{module_court}-{NNN}` |
| `module_id` / `sous_module_id` | string | ✅ | Références existantes |
| `difficulte` | `debutant` \| `intermediaire` \| `avance` | ✅ | Affichée dans la sidebar du QCM |
| `enonce` | string | ✅ | |
| `astuce` | string | ⬜ | Absente → bouton « Aucune astuce » désactivé |
| `choix` | array[4] | ✅ | `{ id, texte }` |
| `reponse_correcte` | `a`–`d` | ✅ | |
| `explication_correcte` / `explication_erreur` | string | ✅ | Encart vert / rouge |
| `termes_lexique` | string[] | ⬜ | Ids de fiches Codex |

### 6.4 Objet `EntreeCodex` (clé JSON : `lexique`)

```json
{
  "id": "conteneur",
  "terme": "Conteneur",
  "categorie": "Conteneurs",
  "module_id": "conteneurs-fondamentaux",
  "definition": "Instance en cours d'exécution d'une image…",
  "role_cicd": "Chaque étape d'un pipeline peut s'exécuter dans un conteneur éphémère…",
  "exemple": "docker run -d -p 8080:80 nginx",
  "voir_aussi": ["image-docker", "dockerfile"]
}
```

`exemple` et `voir_aussi` sont optionnels ; les autres champs sont obligatoires.

### 6.5 Progression (`progression.json`)

```json
{
  "sessions": [{
    "id": "8f0c…", "date": "2026-11-04T10:30:00Z", "module_id": "conteneurs-fondamentaux",
    "score": 15, "total": 20, "successRate": 75, "duree_secondes": 342,
    "xp_gagne": 160, "xp_reponses": 130, "bonus_reussite": 0, "bonus_decouverte": 30
  }],
  "resultats_par_question": { "q-conteneurs-001": { "tentatives": 3, "reussites": 2 } },
  "stats_par_sous_module": {
    "conteneurs-bases": { "tentatives": 9, "reussites": 7, "taux_reussite": 0.78, "dernier_passage": "2026-11-04T10:30:00Z" }
  },
  "xp_total": 480, "niveau": 3, "xp_niveau_actuel": 32, "xp_pour_niveau_suivant": 722
}
```

`niveau`, `xp_niveau_actuel` et `xp_pour_niveau_suivant` sont **toujours recalculés** depuis `xp_total` (`normaliserProgression`).

---

## 7. Navigation

Trois écrans principaux reliés par des onglets (`AppHeader`), plus deux écrans de travail.

| Route | Vue | Rôle |
|---|---|---|
| `/` | `AccueilView` | Onglet **Accueil** : niveau, vue d'ensemble, points à revoir, progression par module, dernières sessions |
| `/modules` | `ModulesView` | Onglet **Modules** : modules regroupés par priorité |
| `/statistiques` | — | Redirige vers `/` (ancien nom de l'accueil) |
| `/codex?terme=<id>` | `CodexView` | Onglet **Codex** : cartes groupées par lettre ; `terme` ouvre la fiche en modale |
| `/module/:moduleId` | `ModuleView` | Présentation du module, parcours des sous-modules, lancement d'une révision |
| `/quiz/:moduleId?mode=short\|long&scope=all\|seen&submodule=<id>` | `QuizView` | Reprise éventuelle, session de QCM puis bilan |
| `/lexique` | — | Redirige vers `/codex` (ancien nom) |
| `*` | — | Redirige vers `/` |

```
[Accueil] [Modules] [Codex]                 ← onglets
    │            │ « Réviser »
    ▼            ▼
  Module ──QCM──▶ Quiz ──fin──▶ Bilan ──▶ Module / Rejouer
                   │
                   └── fiche Codex (modale)
```

---

## 8. Spécifications UI

### 8.1 Règles transverses
- **Thème jour/nuit** sur toutes les vues, mémorisé. Implémentation **uniquement** via les variantes `dark:` de Tailwind (`darkMode: 'class'`, classe `dark` posée sur `<html>`). Un composant ne lit jamais `theme` dans le store pour choisir ses couleurs.
- **Classes Tailwind écrites en entier** : jamais `'priority-' + p`. Passer par un objet de correspondance (`lib/priorites.js`), sinon Tailwind supprime la classe du CSS.
- **Contraste ≥ 4,5:1** pour tout texte, y compris les états désactivés : on atténue avec une couleur (`text-slate-500`), pas avec `opacity`.
- **Accessibilité** : focus visible, `role="dialog"` + piège de focus pour les modales, `role="alert"` pour les erreurs.
- **Jetons de couleur** : voir « Identité visuelle » ci-dessous ; jamais de couleur hexadécimale en dur dans un composant (sauf la couleur propre à chaque module, qui vient des données).
- **Couleur du module** : seul élément coloré propre à chaque module (liseré + tuile d'icône). Le reste de l'interface reste dans la palette slate/bleu.
- **Classes communes** (`index.css`) : `.panel`, `.button-primary`, `.button-secondary`, `.field`, `.segmented` (sélecteur à deux positions avec `aria-pressed`), `.tile` / `.tile-primary` / `.tile-secondary` (grandes actions), `.chip` (filtre à bascule avec `aria-pressed`), `.code-block`.
- **Rédaction** : vouvoiement, phrases courtes, boutons qui disent ce qu'ils font (« Réviser cette étape », « Reprendre la session »). Pas de jargon technique de l'application à l'écran.
- **Mouvement réduit** : `prefers-reduced-motion` coupe animations et transitions.
- **En-tête des écrans principaux** (`AppHeader`) : « Legendary DevOps » à gauche, bouton de thème **discret (icône seule) à droite**, puis la rangée d'onglets, puis le titre de la page. Le thème n'est jamais placé à côté d'un bouton de navigation (D-24). Sur les écrans de travail (Module, bilan), même bouton discret à droite du lien retour ; pendant un QCM, en bas de la barre latérale.
- **Pas de mécanique de pression** : voir « Conception AuDHD-friendly » (§ 1).

### 8.1 bis Identité visuelle « Parcours + soleil » (D-32)

Intention : **tech, mais en évolution, pas geek** — des notions reliées qui mènent à un objectif. Calme, lisible ; le thème suit le système au premier lancement (mode jour le plus souvent).

| Rôle | Nom | Valeur | Utilisation |
|---|---|---|---|
| Texte principal | Encre | `#1E2559` (`slate-900` ≈ `#1B2048`) | Titres, texte ; fond du mode nuit `#121633` (`slate-950`) |
| Couleur d'action | Indigo | `#2E3A87` (`blue-600`) | Boutons principaux, liens, onglet actif, filtres actifs, badge P1 ; en mode nuit `#5B67CF` (`blue-500`) |
| Secondaire | Lavande | `#8C96E8` (`blue-400`) | Liens et accents en mode nuit, traits de l'icône |
| Fond teinté | Brume | `#EEF0FB` (`blue-50`) | Badge P2, survols, fonds légers |
| Fond de page | — | `#FAFAFD` (`slate-50`) | Fond en mode jour |
| **Progression** | **Soleil** | `#F2C14E` (`soleil`) | **Uniquement** ce qui montre une avancée : barre d'XP, barres d'étapes, barre du QCM, lettres du Codex, objectif de l'icône. Jamais en texte sur fond clair : texte encre sur fond soleil |

- Les gammes Tailwind `slate` et `blue` sont **redéfinies** dans `tailwind.config.js` (gris teintés d'indigo, gamme indigo) : les classes existantes suivent la palette sans réécrire les composants.
- **Couleurs sémantiques conservées** : vert/rouge (avec icônes) pour juste/faux, ambre pour « à retravailler ». La couleur propre à chaque module reste un repère.
- **Priorités sans alarme** : P1 indigo plein, P2 brume, P3 contour. Plus de rouge.
- **Police** : Lexend (`@fontsource-variable/lexend`), conçue pour faciliter la lecture ; JetBrains Mono pour le code.
- **Icône / logo** : fond indigo dégradé, trois notions (points brume) reliées par un trait lavande qui monte vers un objectif soleil. Source `public/icon.svg` (aussi affichée à côté du nom dans l'en-tête), `public/icon.png` 512 px (fenêtre Electron), `build/icon.png` 1024 px (installateurs).
- Focus clavier : contour `#5B67CF`, visible sur fond clair et sombre.

### 8.2 QuizView

```
┌───────────────────────┬────────────────────────────────────────────┐
│ ← Quitter vers module │ ZONE QUESTION (défilante)                  │
│ Linux — Fondamentaux  │  Que représente le symbole ~ ?   (h2)      │
│                       │  ┌──────────────────────────────────────┐  │
│ Question              │  │ [A] Le répertoire personnel       ✅ │  │
│ 3 / 20                │  └──────────────────────────────────────┘  │
│ ███░░░░░  (répondues) │  ┌──────────────────────────────────────┐  │
│ ●●○○○○…  (pastilles)  │  │ [B] Le répertoire temporaire      ❌ │  │
│ ✓ 2 justes  ✗ 1 fausse│  └──────────────────────────────────────┘  │
│ • Niveau débutant     │  … [C] [D]                                 │
│ [💡 Astuce DevOps]    │  Encart correction + boutons Codex (noms)  │
│                       ├────────────────────────────────────────────┤
│ XP en fin de session  │ Choisissez une réponse…  [Question suivante]│
│ [Mode jour]           │ BARRE D'ACTION FIXE                        │
└───────────────────────┴────────────────────────────────────────────┘
```

- **Pas de barre globale** : le bouton de thème est dans l'en-tête de chaque écran (en bas de la sidebar pendant un QCM).
- La sidebar suit le thème. Elle affiche : position, barre des questions **répondues**, une pastille par question (verte, rouge, en cours, à venir ; masquées au-delà de 40 questions), score en direct, difficulté de la question, bouton Astuce.
- **Choix mélangés** à chaque nouvelle session (ordre figé dans le brouillon), repérés par les lettres A–D selon leur position.
- **Pas de raccourcis clavier dédiés** (D-16) : la navigation clavier standard (Tab, Entrée, Espace) suffit.
- Barre d'action fixe en bas : `Question suivante`, `Terminer la session`, `Sauvegarde…`, `Réessayer la sauvegarde`.
- Une réponse est définitive.

**États des cadres de réponse (`AnswerChoice`)**

| État | Jour | Nuit | Lettre | Icône |
|---|---|---|---|---|
| Neutre | fond blanc, bordure slate-200 | slate-900, bordure slate-800 | gris | — |
| Survol | slate-50, bordure blue-400 | slate-800, bordure blue-500 | gris | — |
| Choisi correct | emerald-50, bordure 2px emerald-500, gras | emerald-950/50 | verte | `CheckCircle2` |
| Choisi incorrect | rose-50, bordure 2px rose-500, gras | rose-950/50 | rouge | `XCircle` |
| Bonne réponse révélée | emerald-50/60, bordure emerald-400 | emerald-950/20 | verte atténuée | `CheckCircle2` atténué |
| Autres (grisé) | slate-50, texte slate-500 | slate-900/40, texte slate-400 | grise | — |

**Astuce** : désactivée (« Aucune astuce ») si le champ est absent ; un clic déplie l'encart ; masqué à la question suivante.

**Codex en modale** : les boutons du feedback portent le **nom du terme** et ouvrent `CodexModal` (même fiche `CodexCard` que la page Codex) sans quitter le QCM. « Voir aussi » enchaîne les fiches dans la modale avec un lien « Retour à <terme précédent> » ; `Échap` ou « Reprendre le QCM » ferme.

**Reprise de session** : si un brouillon contient au moins une réponse, un écran propose « Reprendre la session » ou « Recommencer à zéro ». Jamais de reprise silencieuse.

**Bilan** (pleine largeur, sans sidebar) : animation « Niveau N atteint » si le niveau a augmenté, score, durée (« 5 min 42 s »), détail des XP, confirmation de sauvegarde **après succès uniquement**. Actions : « Rejouer mes erreurs (n) » (si erreurs), « Rejouer ce QCM », « Tableau de bord ». Section « Revoir mes erreurs » : énoncé, votre réponse, bonne réponse, `explication_correcte`.

### 8.3 ModuleView

```
← Tableau de bord                                         [Mode jour]
┌─ liseré couleur du module ──────────────────────────────────────────┐
│ [icône]  P1  À maîtriser avant toute candidature                     │
│          Linux — Fondamentaux DevSecOps                (h1)          │
│          Résumé du module, 2 à 3 phrases (champ `resume`)            │
│          [FHS] [permissions] [sudo] …           (concepts_cles)      │
│ ──────────────────────────────────────────────────────────────────── │
│ Sous-modules 3 │ Questions 24 │ Maîtrisés 1 / 3 │ Réussite 72 %      │
│ Ouvrir le cours de Stéphane Robert ↗                                 │
└──────────────────────────────────────────────────────────────────────┘
Parcours du module (3/5 de largeur)       │ Réviser tout le module (2/5, collant)
 ① Arborescence & FHS                     │ Questions tirées de
 │  Résumé 2-3 phrases                    │ [Tout le module][Déjà travaillés]
 │  En bonne voie ███░ 75 %  [Réviser…]   │ ┌ Révision rapide ─────────────┐
 ② Droits et permissions                  │ │ 10 questions, ~5 min          │
 │  …                                     │ └──────────────────────────────┘
 ✓ Services systemd (maîtrisé)            │ ┌ Toutes les questions ────────┐
                                          │ │ Les 24 questions, ~12 min     │
                                          │ └──────────────────────────────┘
```

- **Parcours** : étapes numérotées, triées par priorité puis dans l'ordre du cours. La pastille prend la couleur du statut : gris (pas encore travaillé), ambre (à retravailler, < 70 %), bleu (en bonne voie, 70–79 %), vert avec coche (maîtrisé, ≥ 80 %). Taux calculés depuis `resultats_par_question` (`lib/stats.js`).
- Chaque étape : titre, résumé, barre de réussite, nombre de questions, bouton « Réviser cette étape » (ou « Questions à venir »).
- Les tuiles s'appellent « Révision rapide » et « Toutes les questions » (anciennement « Examen complet », qui évoquait une épreuve).
- **Réviser tout le module** : sélecteur à deux positions « Tout le module / Déjà travaillés » (le second est désactivé tant qu'aucune session n'est terminée), puis des tuiles qui disent exactement ce qui va se passer et combien de temps ça prend (environ 30 s par question). La révision rapide (10 questions au hasard) n'apparaît que si la sélection dépasse 10 questions.
- Mise en page sur une colonne sous 1024 px (panneau de révision avant le parcours).

### 8.4 ModulesView (onglet Modules)

```
Legendary DevOps                                                   (☾)
[⌂ Accueil] [▦ Modules] [📖 Codex]
Modules
Classés par priorité de candidature. Choisissez un module pour voir son parcours.
 P1 À maîtriser avant toute candidature   [carte] [carte] [carte]
 P2 Compréhension introductive suffisante  [carte] …
 P3 Culture technique                      [carte] …
```

- Écran d'**exploration** uniquement : pas de niveau, d'XP ni de chiffres globaux (ils sont sur l'accueil, D-23, D-31).
- **Modules regroupés par priorité** (P1, P2, P3) avec la phrase d'explication de chaque priorité.
- **Carte module** : liseré et tuile aux couleurs du module, badge, description, nombre de questions, taux de réussite (ou « Pas encore commencé »), étapes travaillées. Un module sans question a une bordure en pointillés, sans liseré, avec « Questions à venir ».

### 8.5 AccueilView (onglet Accueil, page d'ouverture)

- **Carte niveau** : titre + emoji, niveau, XP total, prochain titre à débloquer, barre vers le niveau suivant.
- **Vue d'ensemble** : questions répondues au moins une fois / total, taux de réussite global, sessions terminées, modules commencés / modules disponibles. **Aucune série de jours** (D-22).
- **À retravailler** : sous-modules travaillés sous 70 %, triés par taux croissant, puis priorité, puis révision la plus ancienne ; 5 affichés au maximum ; bouton « Réviser ». Sans résultat : invitation à commencer par un module P1. Sans point faible : « Rien à retravailler pour l'instant ».
- **Progression par module** : une ligne par module (icône, badge, étapes travaillées, réussite), cliquable vers la page du module ; les modules sans question sont cités à la fin.
- **Dernières sessions** : les 10 plus récentes (date, module, score, XP).
- Calculs dans `lib/stats.js` (`statsGlobales`, `pointsFaibles`, `statsModule`), couverts par `npm test`.

### 8.6 Codex

```
Legendary DevOps                                                   (☾)
[⌂ Accueil] [▦ Modules] [📖 Codex]
Codex
[🔍 Rechercher un terme ou une notion   ✕]  (Toutes 6) (Conteneurs 4) (Linux 2)
 A B C D E F G H I J … Z                      ← index collé en haut
6 termes
 [B]  ┌ carte ┐
 [C]  ┌ carte ┐ ┌ carte ┐
┌ [Linux]          ┐ ┌ [Conteneurs]     ┐ ┌ [Conteneurs]     ┐
│ Bash             │ │ Conteneur        │ │ docker ps        │
│ Définition sur   │ │ …                │ │ …                │
│ 3 lignes max     │ │                  │ │                  │
│ ▌printf '%s\n'   │ │ ▌docker run …    │ │ ▌docker ps -a    │
│ Lire la fiche    │ │ Lire la fiche    │ │ Lire la fiche    │
└──────────────────┘ └──────────────────┘ └──────────────────┘
        clic → fiche complète en modale (CodexModal)
```

- **Cartes groupées par lettre** : une ligne par lettre, la lettre (tuile bleue) dans la marge de gauche et ses cartes à droite (1, 2 ou 3 colonnes selon la largeur). Chaque carte : catégorie, terme, définition sur 3 lignes maximum, première ligne de l'exemple, « Lire la fiche ». Toute la carte est cliquable.
- **Index alphabétique A–Z** collé en haut pendant le défilement : les lettres présentes sont cliquables et font défiler jusqu'à leur groupe, les autres sont grisées. Les termes qui ne commencent pas par une lettre sont rangés sous « # » (D-25).
- **Fiche complète en modale** (`CodexModal` + `CodexCard`, les mêmes que pendant un QCM) : catégorie, terme, définition, encadré « Dans un pipeline CI/CD », exemple avec « Copier », « Voir aussi » enchaînés dans la modale avec « Retour à… », module d'origine (lien vers sa page depuis la page Codex), nombre de questions qui abordent le terme. `Échap`, la croix ou « Fermer » ferment la fiche.
- **Recherche** en temps réel, insensible à la casse et aux accents, sur le terme, la définition, le rôle CI/CD et l'exemple ; compteur « N résultats sur M ».
- **Filtres par catégorie** : pastilles à bascule avec le nombre de termes (D-17).
- **État vide** : « Aucun terme ne correspond à « … » » + « Effacer les filtres ».
- **Lien direct** : `/codex?terme=<id>` ouvre la page avec la fiche en modale ; la fermer retire le paramètre.

---

## 9. Système XP et niveaux

`XP_requis(N) = round(100 × N^1.8)` pour passer du niveau N au niveau N+1. Niveau maximum : 50.

> Valeurs calculées par `shared/progression.js`. Les exemples de la v1 du document (1 149 XP au niveau 5…) ne correspondaient pas à la formule.

| Niveau | XP pour le suivant | XP cumulé pour l'atteindre |
|---|---|---|
| 1 | 100 | 0 |
| 5 | 1 812 | 2 383 |
| 10 | 6 310 | 19 473 |
| 20 | 21 971 | 146 115 |

| Action | XP |
|---|---|
| Bonne réponse à une question **jamais tentée auparavant** | +10 |
| Bonne réponse à une question déjà tentée (session précédente) | +5 |
| Session à 100 % | +50 |
| Session ≥ 80 % (non cumulable avec 100 %) | +20 |
| Première session terminée dans un module | +30 |

L'XP n'est attribué qu'à la **fin** de la session (pas pendant).

| Niveaux | Titre |
|---|---|
| 1 – 3 | 🧑‍💻 Stagiaire DevOps |
| 4 – 7 | 🔧 Junior DevOps |
| 8 – 12 | ⚙️ DevOps Engineer |
| 13 – 18 | 🚀 DevOps Confirmé |
| 19 – 25 | 🏗️ DevOps Senior |
| 26 – 33 | 🔐 DevSecOps Expert |
| 34 – 42 | 🌐 Principal Engineer |
| 43 – 49 | 🏆 Staff Engineer |
| 50 | ⚡ Légende du DevOps |

---

## 10. Catalogue des modules

🔴 P1 : à maîtriser avant toute candidature · 🟠 P2 : compréhension introductive · 🟡 P3 : culture technique

| ID | Label | Prio | Dans `dataApp.json` |
|---|---|---|---|
| `linux-fondamentaux` | Linux — Fondamentaux DevSecOps | 🔴 | ✅ (2 questions) |
| `linux-parcours` | Linux — Parcours B0 à B6 | 🔴 | |
| `git` | Git | 🔴 | ✅ (0 question) |
| `culture-devops` | Culture DevOps | 🟠 | |
| `conteneurs-fondamentaux` | Conteneurs — Fondamentaux | 🔴 | ✅ (1 question) |
| `conteneurs-complement` | Conteneurs — Compléments | 🔴 | |
| `scripting` | Scripting (Bash & Python) | 🔴 | |
| `reseau-base` | Réseau de base | 🔴 | |
| `reseau-parcours` | Réseau — Parcours 02 à 07 | 🔴 | |
| `cloud-base` | Cloud de base | 🔴 | |
| `cloud-azure` | Cloud — Complément Azure | 🟠 | |
| `cicd-fondamentaux` | CI/CD — Fondamentaux | 🔴 | |
| `gitlab-volet1` | GitLab CI — Volet 1 (modules 1–14) | 🔴 | |
| `gitlab-volet2` | GitLab CI — Volet 2 Industrialisation | 🟠 | |
| `gitlab-volet3` | GitLab CI — Volet 3 Sécurité | 🟡 | |
| `iac-fondamentaux` | IaC — Fondamentaux | 🔴 | |
| `terraform-decouvrir` | Terraform — Découvrir | 🔴 | |
| `terraform-ecrire` | Terraform — Écrire du code | 🔴 | |
| `terraform-infra` | Terraform — Premières infrastructures | 🟠 | |
| `terraform-state` | Terraform — State | 🟠 | |
| `terraform-modules` | Terraform — Modules | 🟡 | |
| `ansible-demarrer` | Ansible — Comprendre et démarrer | 🟠 | |
| `ansible-ecrire` | Ansible — Écrire du code | 🟠 | |
| `kubernetes-fondamentaux` | Kubernetes — Fondamentaux | 🔴 | |
| `kubernetes-reseau` | Kubernetes — Réseau et exposition | 🟠 | |
| `kubernetes-exploitation` | Kubernetes — Exploitation et diagnostic | 🔴 | |
| `kubernetes-k3s` | Kubernetes — K3s et K3d | 🟠 | |
| `gitops-argocd` | GitOps — ArgoCD | 🟠 | |
| `observabilite-02` | Observabilité — Comprendre et préparer | 🟠 | |
| `observabilite-03` | Observabilité — Métriques (Prometheus) | 🔴 | |
| `observabilite-04` | Observabilité — Grafana et alerting | 🔴 | |
| `observabilite-05` | Observabilité — Journaux (Loki) | 🟠 | |
| `observabilite-06` | Observabilité — OpenTelemetry | 🟡 | |
| `observabilite-07` | Observabilité — Fondamentaux approfondis | 🟠 | |
| `observabilite-08` | Observabilité — Pratiques d'exploitation | 🟡 | |
| `sre` | SRE — Fondamentaux | 🟠 | |
| `platform-engineering` | Platform Engineering | 🟠 | |
| `architecture-exploitation` | Architecture et exploitation | 🟠 | |
| `securite-socle` | Sécurité — Socle opérationnel | 🟠 | |
| `depannage` | Dépannage transversal | 🔴 | |

Liens de cours : voir `lien_cours` de chaque module dans `dataApp.json` (base : https://www.stephane-robert.info/docs/).

---

## 11. Roadmap

### ✅ Phase 0 — Fondations (terminée)
- [x] Vite + React + Tailwind + Electron
- [x] `vite.config.js` : main en ESM, preload en CommonJS
- [x] `electron/main.js` : fenêtre, IPC, lecture de `dataApp.json`
- [x] `electron/preload.js` : bridge `window.electronAPI`
- [x] Router (HashRouter, 4 écrans + redirections)
- [x] Store Zustand
- [x] Logique partagée `shared/progression.js` + tests unitaires
- [x] Test de parcours Electron/navigateur (`npm run test:electron`)

### ✅ Phase 1 — Interface QCM (terminée)
- [x] QuizView, QuestionCard, AnswerChoice, FeedbackPanel
- [x] SidebarQuiz + TipPanel animé
- [x] useQuiz : navigation, brouillon repris après fermeture, sauvegarde unique par `id`
- [x] Sauvegarde via IPC, nouvelle tentative possible en cas d'échec
- [x] CodexModal (fiche sans quitter le QCM), QuizSummary (bilan)
- [x] ModuleView (choix court/long/sous-module, filtre « déjà pratiqués »)
- [x] Thème jour/nuit mémorisé
- [x] **Corrections du 2026-11-04** : badges de priorité sans style, bouton suivant hors écran (barre fixe), progression fausse, contraste de l'état grisé, thème géré en double + sélecteurs Zustand

### ✅ Phase 1.5 — Finitions QCM et page Module (terminée le 2026-11-04)
- [x] Lettres A–D sur les choix ; ordre des choix mélangé par session et figé dans le brouillon
- [x] Barre globale supprimée, bouton de thème dans l'en-tête de chaque écran
- [x] Phrase technique retirée de l'écran de question
- [x] Sidebar : score en direct, pastilles par question, difficulté
- [x] Boutons Codex libellés avec le nom du terme (feedback, modale, page Codex)
- [x] Reprise explicite d'un brouillon ; purge des brouillons de plus de 30 jours ou orphelins
- [x] Bilan : revoir mes erreurs, rejouer mes erreurs, durée lisible, sidebar masquée
- [x] Animation de passage de niveau
- [x] **Page Module refaite** : résumé du module (`resume`), notions clés, chiffres clés, lien vers le cours, parcours des sous-modules avec résumé et statut, tuiles « Révision rapide » / « Examen complet » avec durée estimée
- [x] Dashboard : tuile et couleur de chaque module, barre des étapes travaillées
- [x] Liens externes ouverts dans le navigateur du système (`setWindowOpenHandler`)

### ✅ Phase 2 — Codex (terminée le 2026-11-04)
- [x] `LexiconView.jsx` renommé `CodexView.jsx` ; fiche extraite dans `components/codex/CodexCard.jsx`, partagée avec la modale du QCM
- [x] Grille de cartes, fiche complète en modale (format retenu après essai d'une mise en page liste + fiche, D-19)
- [x] Recherche insensible aux accents, compteur de résultats, état vide avec action
- [x] Filtres par catégorie en pastilles avec compteurs
- [x] « Voir aussi » : noms des termes, enchaînement dans la modale avec « Retour à… »
- [x] Lien direct `/codex?terme=<id>`
- [x] Bouton « Copier » sur les exemples, module d'origine et nombre de questions liées
- [x] Raccourcis clavier du QCM retirés (D-16)

### ✅ Phase 3 — Tableau de bord, statistiques et parcours (terminée le 2026-11-05)
- [x] Statistiques déplacées dans un onglet dédié ; écran Modules réservé à l'exploration ; onglets Modules / Statistiques / Codex (2026-11-05)
- [x] Série de jours retirée (2026-11-05, D-22)
- [x] Modules regroupés par priorité (P1, P2, P3) avec explication
- [x] Cartes modules : taux de réussite, étapes travaillées ; modules sans question en pointillés
- [x] `WeakPointsPanel` : sous-modules < 70 %, triés par urgence, bouton « Réviser » ; états « commencer » et « aucun point faible »
- [x] Vue d'ensemble : questions répondues, taux global, sessions, modules commencés
- [x] Carte niveau avec le prochain titre à débloquer
- [x] Tests unitaires des statistiques (statuts, points faibles, vue d'ensemble)

### ✅ Phase 4 — Qualité, sécurité et packaging (code terminé le 2026-11-05)
- [x] Electron 28 → **44** (version supportée) ; `vite-plugin-electron-renderer` retiré ; dépendances d'interface en `devDependencies`
- [x] `sandbox: true`, garde de navigation (`will-navigate`), CSP ajoutée au build
- [x] `electron-builder` : NSIS (`.exe`, x64) et DMG (x64 + arm64), `dataApp.json` en `extraResources` (modifiable après installation), sortie dans `release/`
- [x] Renommage : `name: legendary-devops`, `productName: Legendary DevOps`, dossier de données fixe + copie de l'ancienne progression
- [x] Icône de l'application (`build/icon.png`) et favicon (`public/icon.svg`)
- [x] Polices Inter et JetBrains Mono embarquées, `font-sans` appliqué
- [x] `npm run validate-data` (lancé automatiquement par `npm run build`) : erreurs bloquantes, avertissements pour le contenu à compléter
- [x] Nettoyage : fichiers et dossiers inutilisés, double persistance du thème, JSDoc du preload
- [ ] **Tester les installateurs** : `npm run dist:win` sur Windows, `npm run dist:mac` sur un Mac (installation, lancement, progression conservée, `dataApp.json` modifiable dans le dossier `resources/data`)
- [ ] *(Plus tard)* Signature de code Windows / macOS : sans signature, Windows SmartScreen et macOS Gatekeeper affichent un avertissement au premier lancement

### 🚀 Phase 5 — Contenu

| Lot | Objectif | Actuel |
|---|---|---|
| Linux — Fondamentaux | 30 | 2 |
| Linux — Parcours B0-B6 | 20 | 0 |
| Git | 20 | 0 |
| Culture DevOps | 15 | 0 |
| Conteneurs — Fondamentaux | 30 | 1 |
| Conteneurs — Compléments | 15 | 0 |
| Scripting Bash/Python | 20 | 0 |
| Réseau | 25 | 0 |
| Cloud / Azure | 20 | 0 |
| CI/CD + GitLab CI Volet 1 | 30 | 0 |
| GitLab CI Volets 2 et 3 | 15 | 0 |
| IaC + Terraform | 30 | 0 |
| Ansible | 15 | 0 |
| Kubernetes | 25 | 0 |
| Observabilité | 20 | 0 |
| SRE / Platform / Dépannage | 15 | 0 |
| **Fiches Codex** | **80** | **6** |

Chaque nouveau module et sous-module arrive avec son `resume` de 2-3 phrases : à quoi il sert, ce que l'on saura faire après.

---

## 12. Conventions de code

| Sujet | Règle |
|---|---|
| Composants | PascalCase (`AnswerChoice.jsx`) |
| Hooks | `use` + camelCase (`useQuiz.js`) |
| Store | camelCase + `Store` (`statsStore.js`) ; lecture **toujours via un sélecteur** (`useStatsStore(s => s.x)` ou `useShallow`) |
| IDs | modules et Codex en kebab-case ; questions `q-{module_court}-{NNN}` ; sous-modules `{module}-{court}` |
| Questions | Toujours 4 choix `a`–`d` |
| Styles | Classes Tailwind utilitaires ; classes communes dans `index.css` (`.panel`, `.button-primary`…) ; thème via `dark:` ; jamais de nom de classe construit dynamiquement |
| Animations | Framer Motion |
| Electron | Communication uniquement par IPC nommé via `window.electronAPI` ; aucun accès Node dans le renderer |
| Logique métier | Calculs de progression dans `shared/` (testables sans React ni Electron) |
| Langue | Interface en français ; noms métier en français (`enregistrerSession`, `priorite`) |
| Avant de livrer | `npm test` · `npm run lint` · `npm run build` (inclut `validate-data`) · `npm run test:electron` |
| Contenu | Après chaque modification de `dataApp.json` : `npm run validate-data` |
| Documentation | Toute décision structurante → ce fichier, section 13 |

---

## 13. Journal des décisions

| # | Date | Décision | Raison |
|---|---|---|---|
| D-01 | 2026-11-04 | **Tailwind 3.4 conservé** (au lieu de la v4 visée au départ) | Tout le code repose sur `tailwind.config.js`, `@tailwind` et `@apply` en `@layer`. La v4 n'apporte aucune fonctionnalité utile au projet aujourd'hui ; migration possible plus tard avec l'outil officiel `@tailwindcss/upgrade` |
| D-02 | 2026-11-04 | electron-store 8 conservé | Compatible avec le build actuel ; la v10 est ESM-only |
| D-03 | 2026-11-04 | ~~Electron 28 à mettre à jour en Phase 4~~ — fait, voir D-26 | — |
| D-04 | 2026-11-04 | Score et XP calculés côté main à partir des réponses brutes, `id` de session unique | Pas de double crédit, pas de calcul de confiance dans le renderer |
| D-05 | 2026-11-04 | Écran **Module** ajouté (`/module/:moduleId`) | Choisir entre module entier, sous-module, QCM court ou long avant de lancer une session |
| D-06 | 2026-11-04 | « Lexique » renommé **« Codex »** dans l'interface ; clés JSON inchangées | Terme plus proche de l'univers informatique ; ne pas casser le contenu |
| D-07 | 2026-11-04 | Projet renommé **Legendary DevOps** (titre, en-tête, README) | Identité du projet ; `package.json` inchangé jusqu'à la migration de la Phase 4 |
| D-08 | 2026-11-04 | Thème jour/nuit sur toutes les vues, sidebar comprise | Cohérence visuelle ; remplace la sidebar toujours foncée de la maquette initiale |
| D-09 | 2026-11-04 | Brouillons de session dans `localStorage` | Données jetables, propres à l'appareil ; la progression reste dans electron-store |
| D-10 | 2026-11-04 | Codex consultable en modale pendant le QCM | Ne pas perdre le fil de la session |
| D-11 | 2026-11-04 | Champs `resume` ajoutés aux modules et sous-modules | `description` reste une liste courte pour les cartes ; `resume` explique en clair sur la page Module |
| D-12 | 2026-11-04 | Lancement d'une révision par tuiles explicites (« Révision rapide », « Examen complet ») au lieu d'un menu déroulant et de boutons court/long | Chaque action dit ce qu'elle lance et combien de temps elle prend |
| D-13 | 2026-11-04 | Sous-modules présentés comme un parcours numéroté (ordre du cours) | L'ordre des sous-modules suit la progression pédagogique ; le statut coloré montre où en est l'élève |
| D-14 | 2026-11-04 | Ordre des choix mélangé par session | Éviter la mémorisation de la position de la bonne réponse |
| D-15 | 2026-11-04 | Plus de barre globale ; thème dans l'en-tête de chaque écran | Récupérer de la hauteur, surtout pendant le QCM |
| D-16 | 2026-11-04 | Raccourcis clavier du QCM retirés | Peu utiles pour le public visé ; ils ajoutaient une aide à l'écran et de la logique pour un gain faible. La navigation clavier standard reste accessible |
| D-17 | 2026-11-04 | Codex : filtre par catégorie seulement, pas de filtre par module | Les catégories recoupent déjà les modules ; deux rangées de filtres embrouillaient la recherche. Le module figure sur chaque fiche |
| D-18 | 2026-11-04 | ~~Codex en deux colonnes (liste + fiche)~~ — remplacée par D-19 | — |
| D-19 | 2026-11-04 | **Codex en grille de cartes, fiche complète en modale** | Retour de l'équipe : les cartes sont plus intuitives qu'une page fixe avec une liste latérale. La modale réutilise la fiche du QCM, et « Voir aussi » n'y masque rien |
| D-20 | 2026-11-04 | Points faibles triés par taux, puis priorité, puis ancienneté de révision ; 5 affichés | Montrer d'abord ce qui rapporte le plus à retravailler, sans noyer l'élève |
| D-21 | 2026-11-04 | ~~Série de jours~~ — retirée, voir D-22 | — |
| D-22 | 2026-11-05 | **Aucune série de jours ni mécanique de régularité** | Interface AuDHD-friendly : la pression des *streaks* crée de l'anxiété et de la culpabilité après une pause. La progression ne se perd jamais |
| D-23 | 2026-11-05 | Statistiques dans un onglet dédié ; l'écran Modules sert à explorer | Le nombre de modules va augmenter : mêler chiffres et exploration surchargerait l'écran principal |
| D-24 | 2026-11-05 | Onglets Modules / Statistiques / Codex ; bouton de thème discret (icône seule), séparé de la navigation | Navigation et réglage d'affichage n'ont pas la même priorité |
| D-25 | 2026-11-05 | Codex : cartes groupées par lettre + index A–Z collé en haut | Se repérer dans une longue liste de termes sans tout parcourir |
| D-26 | 2026-11-05 | Electron **44** | Version supportée au 5 novembre 2026 (43, 44 et 45 sont maintenues) ; Node 24 |
| D-27 | 2026-11-05 | Dossier de données fixe `legendary-devops` + copie de l'ancien `devops-quiz` | Le nom affiché peut changer sans déplacer la progression ; l'ancienne progression est reprise sans être effacée |
| D-28 | 2026-11-05 | CSP injectée au build seulement | En développement, le rechargement à chaud de Vite utilise des scripts en ligne |
| D-31 | 2026-11-05 | La page de progression devient l'**accueil** (`/`) ; onglets Accueil / Modules / Codex ; Modules passe en `/modules` | Elle réunit progression, points à revoir et sessions : c'est le bon point de départ à chaque ouverture |
| D-32 | 2026-11-05 | **Identité « Parcours + soleil »** : piste B (indigo, lavande, Lexend, icône « notions reliées ») avec le jaune de la piste C à la place du vert ; le jaune signifie la progression ; priorités sans rouge ; thème par défaut = système | Choix de la propriétaire du projet après comparaison de trois pistes (audit du 5 novembre). Remplace l'apparence « outil de développeur » (gris/bleu Tailwind, mode nuit par défaut, icône infini) |
| D-33 | 2026-11-05 | Le dépôt Git est le dossier du projet côté **Windows**, piloté avec le Git de **WSL** via `/mnt/c/…` (`core.fileMode false`) ; npm et Electron restent côté Windows | Un seul dossier pour coder et versionner ; la clé SSH GitHub est configurée dans WSL, pas sous Windows. Usage personnel : la propriétaire est la principale testeuse |
| D-29 | 2026-11-05 | Seul `electron-store` en `dependencies` | Le reste est intégré par Vite ; l'application packagée reste légère |
| D-30 | 2026-11-05 | Node.js ≥ 22.12 exigé, vérifié avant `npm install` | Electron 44 ne s'installe pas avec Node 18 (fin de support en avril 2025) ; l'erreur d'origine (`ERR_REQUIRE_ESM`) était incompréhensible |
