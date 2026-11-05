# ARCHITECTURE.md — DevOps Quiz App
> **Rôle de ce fichier :** Document de référence unique du projet. À fournir en contexte au début de chaque nouvelle session de développement pour garantir la cohérence des décisions techniques.

---

## 1. Objectif de l'Application

### Public cible
Étudiant en reconversion ou en formation initiale, préparant un **stage ou une première expérience professionnelle en DevOps**.

### But
Proposer un outil de **révision active et ludique** couvrant les grandes thématiques DevOps organisées par priorité de candidature, en s'appuyant sur le programme de Stéphane Robert.

### Contraintes fondamentales

| Contrainte | Détail |
|---|---|
| ❌ Aucun backend | Pas de serveur, pas d'API, pas de base de données distante |
| ✅ Exécution 100 % locale | L'application tourne entièrement sur la machine de l'utilisateur |
| ✅ Données modifiables sans code | Le contenu (questions, définitions) est éditable via un simple éditeur de texte |
| ✅ Multi-plateforme | Distribué en `.exe` (Windows) et `.dmg` (macOS) via Electron Builder |
| ✅ Hors-ligne total | Aucune requête réseau n'est nécessaire au fonctionnement |

---

## 2. La Stack Technique

```
┌─────────────────────────────────────────────────────────┐
│                     COUCHE PRÉSENTATION                 │
│   React 18  ·  React Router v6  ·  Tailwind CSS v4     │
│   Framer Motion (animations)  ·  Lucide React (icônes) │
├─────────────────────────────────────────────────────────┤
│                     COUCHE ÉTAT GLOBAL                  │
│              Zustand (store léger, persistable)         │
├─────────────────────────────────────────────────────────┤
│                     COUCHE DONNÉES                      │
│   Contenu froid : dataApp.json  (lu au démarrage)      │
│   Contenu chaud : electron-store (fichier JSON local)   │
├─────────────────────────────────────────────────────────┤
│                     COUCHE DESKTOP                      │
│           Electron 31  ·  Vite (bundler)               │
│    vite-plugin-electron  ·  electron-builder (packaging)│
└─────────────────────────────────────────────────────────┘
```

| Librairie | Version cible | Rôle |
|---|---|---|
| `react` | 18.x | UI déclarative |
| `react-router-dom` | 6.x | Navigation entre les 3 vues |
| `tailwindcss` | 4.x | Styling utility-first |
| `framer-motion` | 11.x | Animations fluides (feedback réponses, transitions) |
| `lucide-react` | latest | Icônes SVG (check, x, book, chart, lightbulb…) |
| `zustand` | 4.x | Store global + persistance via middleware |
| `electron` | 31.x | Shell desktop natif |
| `electron-store` | 10.x | Persistance JSON locale (progression, stats) |
| `vite` | 5.x | Bundler ultra-rapide |
| `vite-plugin-electron` | latest | Bridge Vite ↔ Electron |
| `electron-builder` | latest | Packaging `.exe` / `.dmg` |

---

## 3. Les Modules de Révision

### Légende des priorités
- 🔴 **P1** : À maîtriser avant toute candidature
- 🟠 **P2** : Important, une compréhension introductive suffit
- 🟡 **P3** : Culture technique, à approfondir selon les offres

### Catalogue complet des modules

| ID module | Label affiché | Priorité | Lien cours |
|---|---|---|---|
| `linux-fondamentaux` | Linux — Fondamentaux DevSecOps | 🔴 P1 | https://www.stephane-robert.info/docs/admin-serveurs/linux/ |
| `linux-parcours` | Linux — Parcours B0 à B6 | 🔴 P1 | https://www.stephane-robert.info/docs/admin-serveurs/linux/ |
| `git` | Git | 🔴 P1 | https://www.stephane-robert.info/docs/developper/version/git/ |
| `culture-devops` | Culture DevOps | 🟠 P2 | https://www.stephane-robert.info/docs/ |
| `conteneurs-fondamentaux` | Conteneurs — Fondamentaux | 🔴 P1 | https://www.stephane-robert.info/docs/conteneurs/moteurs-conteneurs/docker/ |
| `conteneurs-complement` | Conteneurs — Compléments | 🔴 P1 | https://www.stephane-robert.info/docs/conteneurs/moteurs-conteneurs/docker/ |
| `scripting` | Scripting (Bash & Python) | 🔴 P1 | https://www.stephane-robert.info/docs/ |
| `reseau-base` | Réseau de base | 🔴 P1 | https://www.stephane-robert.info/docs/ |
| `reseau-parcours` | Réseau — Parcours 02 à 07 | 🔴 P1 | https://www.stephane-robert.info/docs/ |
| `cloud-base` | Cloud de base | 🔴 P1 | https://www.stephane-robert.info/docs/ |
| `cloud-azure` | Cloud — Complément Azure | 🟠 P2 | https://www.stephane-robert.info/docs/ |
| `cicd-fondamentaux` | CI/CD — Fondamentaux | 🔴 P1 | https://www.stephane-robert.info/docs/pipeline-cicd/gitlab/ |
| `gitlab-volet1` | GitLab CI — Volet 1 (modules 1–14) | 🔴 P1 | https://www.stephane-robert.info/docs/pipeline-cicd/gitlab/ |
| `gitlab-volet2` | GitLab CI — Volet 2 Industrialisation | 🟠 P2 | https://www.stephane-robert.info/docs/pipeline-cicd/gitlab/ |
| `gitlab-volet3` | GitLab CI — Volet 3 Sécurité | 🟡 P3 | https://www.stephane-robert.info/docs/pipeline-cicd/gitlab/ |
| `iac-fondamentaux` | IaC — Fondamentaux | 🔴 P1 | https://www.stephane-robert.info/docs/infra-as-code/provisionnement/terraform/ |
| `terraform-decouvrir` | Terraform — Découvrir | 🔴 P1 | https://www.stephane-robert.info/docs/infra-as-code/provisionnement/terraform/ |
| `terraform-ecrire` | Terraform — Écrire du code | 🔴 P1 | https://www.stephane-robert.info/docs/infra-as-code/provisionnement/terraform/ |
| `terraform-infra` | Terraform — Premières infrastructures | 🟠 P2 | https://www.stephane-robert.info/docs/infra-as-code/provisionnement/terraform/ |
| `terraform-state` | Terraform — State | 🟠 P2 | https://www.stephane-robert.info/docs/infra-as-code/provisionnement/terraform/ |
| `terraform-modules` | Terraform — Modules | 🟡 P3 | https://www.stephane-robert.info/docs/infra-as-code/provisionnement/terraform/ |
| `ansible-demarrer` | Ansible — Comprendre et démarrer | 🟠 P2 | https://www.stephane-robert.info/docs/ |
| `ansible-ecrire` | Ansible — Écrire du code | 🟠 P2 | https://www.stephane-robert.info/docs/ |
| `kubernetes-fondamentaux` | Kubernetes — Fondamentaux | 🔴 P1 | https://www.stephane-robert.info/docs/conteneurs/orchestrateurs/kubernetes/ |
| `kubernetes-reseau` | Kubernetes — Réseau et exposition | 🟠 P2 | https://www.stephane-robert.info/docs/conteneurs/orchestrateurs/kubernetes/ |
| `kubernetes-exploitation` | Kubernetes — Exploitation et diagnostic | 🔴 P1 | https://www.stephane-robert.info/docs/conteneurs/orchestrateurs/kubernetes/ |
| `kubernetes-k3s` | Kubernetes — K3s et K3d | 🟠 P2 | https://www.stephane-robert.info/docs/conteneurs/orchestrateurs/kubernetes/ |
| `gitops-argocd` | GitOps — ArgoCD | 🟠 P2 | https://www.stephane-robert.info/docs/ |
| `observabilite-02` | Observabilité — Comprendre et préparer | 🟠 P2 | https://www.stephane-robert.info/docs/ |
| `observabilite-03` | Observabilité — Métriques (Prometheus) | 🔴 P1 | https://www.stephane-robert.info/docs/ |
| `observabilite-04` | Observabilité — Grafana et alerting | 🔴 P1 | https://www.stephane-robert.info/docs/ |
| `observabilite-05` | Observabilité — Journaux (Loki) | 🟠 P2 | https://www.stephane-robert.info/docs/ |
| `observabilite-06` | Observabilité — OpenTelemetry | 🟡 P3 | https://www.stephane-robert.info/docs/ |
| `observabilite-07` | Observabilité — Fondamentaux approfondis | 🟠 P2 | https://www.stephane-robert.info/docs/ |
| `observabilite-08` | Observabilité — Pratiques d'exploitation | 🟡 P3 | https://www.stephane-robert.info/docs/ |
| `sre` | SRE — Fondamentaux | 🟠 P2 | https://www.stephane-robert.info/docs/ |
| `platform-engineering` | Platform Engineering | 🟠 P2 | https://www.stephane-robert.info/docs/ |
| `architecture-exploitation` | Architecture et exploitation | 🟠 P2 | https://www.stephane-robert.info/docs/ |
| `securite-socle` | Sécurité — Socle opérationnel | 🟠 P2 | https://www.stephane-robert.info/docs/ |
| `depannage` | Dépannage transversal | 🔴 P1 | https://www.stephane-robert.info/docs/ |

---

## 4. Le Modèle de Données

### 4.1 Fichier source — `public/data/dataApp.json`

> ⚠️ Le fichier s'appelle **`dataApp.json`** (et non `donnees.json`).

Structure racine :

```json
{
  "modules": [ ... ],
  "questions": [ ... ],
  "lexique": [ ... ]
}
```

---

#### 4.1.1 Objet `Module`

```json
{
  "id": "conteneurs-fondamentaux",
  "label": "Conteneurs — Fondamentaux",
  "description": "Virtualisation vs conteneurisation, images, Dockerfile, volumes, réseaux, Compose",
  "icon": "container",
  "couleur": "#2496ED",
  "priorite": "P1",
  "lien_cours": "https://www.stephane-robert.info/docs/conteneurs/moteurs-conteneurs/docker/",
  "concepts_cles": [
    "images", "conteneurs", "Dockerfile", "couches d'image",
    "volumes", "bind mounts", "réseaux", "Docker Compose", "healthchecks"
  ],
  "sous_modules": [
    { "id": "conteneurs-bases", "label": "Fondamentaux (image, run, PS)" },
    { "id": "conteneurs-dockerfile", "label": "Écrire un Dockerfile" },
    { "id": "conteneurs-compose", "label": "Docker Compose" },
    { "id": "conteneurs-reseau", "label": "Réseau et volumes" }
  ]
}
```

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Identifiant unique kebab-case |
| `label` | `string` | ✅ | Nom affiché dans l'UI |
| `description` | `string` | ✅ | Sous-titre descriptif |
| `icon` | `string` | ✅ | Nom d'icône Lucide React |
| `couleur` | `string` (hex) | ✅ | Couleur d'accent du module |
| `priorite` | `enum` | ✅ | `"P1"` \| `"P2"` \| `"P3"` |
| `lien_cours` | `string` (URL) | ✅ | Lien vers la ressource de cours |
| `concepts_cles` | `string[]` | ✅ | Concepts à maîtriser (affiché sur le dashboard) |
| `sous_modules` | `array` | ✅ | Liste des sous-modules pour les stats granulaires |

---

#### 4.1.2 Objet `Question`

> ⚠️ **Exactement 4 choix par question, toujours.** L'interface est conçue pour afficher précisément 4 cadres de réponse.

> ⚠️ **Le champ `astuce` est optionnel** dans le JSON. Si présent, il est révélé uniquement quand l'utilisateur clique sur le bouton 💡 "Astuce" pendant la session. Il n'est jamais affiché automatiquement.

```json
{
  "id": "q-conteneurs-001",
  "module_id": "conteneurs-fondamentaux",
  "sous_module_id": "conteneurs-bases",
  "difficulte": "intermediaire",
  "enonce": "Quelle commande permet de lister tous les conteneurs Docker, y compris ceux qui sont arrêtés ?",
  "astuce": "Le flag '-a' signifie 'all' dans la plupart des commandes Docker.",
  "choix": [
    { "id": "a", "texte": "docker ps" },
    { "id": "b", "texte": "docker ps -a" },
    { "id": "c", "texte": "docker list --all" },
    { "id": "d", "texte": "docker container show" }
  ],
  "reponse_correcte": "b",
  "explication_correcte": "docker ps -a affiche tous les conteneurs, quel que soit leur état (running, exited, created…).",
  "explication_erreur": "docker ps sans flag n'affiche que les conteneurs actifs. Les commandes 'list' et 'show' n'existent pas dans Docker.",
  "termes_lexique": ["conteneur", "docker-ps"]
}
```

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Identifiant unique (`q-{module}-{NNN}`) |
| `module_id` | `string` | ✅ | Référence à un `Module.id` |
| `sous_module_id` | `string` | ✅ | Référence à un `SousModule.id` |
| `difficulte` | `enum` | ✅ | `"debutant"` \| `"intermediaire"` \| `"avance"` |
| `enonce` | `string` | ✅ | Texte de la question |
| `astuce` | `string` | ⬜ | Révélée **uniquement sur clic** du bouton 💡. Absente = bouton grisé |
| `choix` | `array[4]` | ✅ | **Exactement 4** objets `{id, texte}`. IDs : `"a"`, `"b"`, `"c"`, `"d"` |
| `reponse_correcte` | `string` | ✅ | La valeur `id` du choix correct |
| `explication_correcte` | `string` | ✅ | Message vert après bonne réponse |
| `explication_erreur` | `string` | ✅ | Message rouge après mauvaise réponse |
| `termes_lexique` | `string[]` | ⬜ | IDs d'entrées lexique à lier dans le feedback |

---

#### 4.1.3 Objet `EntreeLexique`

```json
{
  "id": "conteneur",
  "terme": "Conteneur",
  "categorie": "Conteneurs",
  "module_id": "conteneurs-fondamentaux",
  "definition": "Instance en cours d'exécution d'une image Docker. Un conteneur est un processus isolé qui dispose de son propre système de fichiers, réseau et espace de processus.",
  "role_cicd": "Dans un pipeline CI/CD, chaque étape (build, test, deploy) peut s'exécuter dans un conteneur éphémère et reproductible, garantissant l'isolation et la parité entre les environnements.",
  "exemple": "docker run -d -p 8080:80 nginx",
  "voir_aussi": ["image-docker", "dockerfile", "docker-compose"]
}
```

| Champ | Type | Obligatoire | Description |
|---|---|---|---|
| `id` | `string` | ✅ | Identifiant kebab-case (target des liens depuis QCM) |
| `terme` | `string` | ✅ | Terme affiché |
| `categorie` | `string` | ✅ | Catégorie affichée (pour le filtre) |
| `module_id` | `string` | ✅ | Référence au module parent |
| `definition` | `string` | ✅ | Définition académique complète |
| `role_cicd` | `string` | ✅ | Rôle dans un pipeline CI/CD ou une infra |
| `exemple` | `string` | ⬜ | Commande ou extrait de code illustratif |
| `voir_aussi` | `string[]` | ⬜ | IDs d'autres entrées lexique |

---

### 4.2 Fichier de progression — géré par `electron-store`

Stocké automatiquement dans :
- **Windows** : `%APPDATA%/devops-quiz/config.json`
- **macOS** : `~/Library/Application Support/devops-quiz/config.json`

> ⚠️ **Jamais édité manuellement.** Ce fichier est entièrement géré par l'application.

```json
{
  "sessions": [
    {
      "date": "2026-11-04T10:30:00Z",
      "module_id": "conteneurs-fondamentaux",
      "score": 15,
      "total": 20,
      "duree_secondes": 342
    }
  ],
  "resultats_par_question": {
    "q-conteneurs-001": { "tentatives": 3, "reussites": 2 },
    "q-git-005": { "tentatives": 5, "reussites": 1 }
  },
  "stats_par_sous_module": {
    "conteneurs-bases": {
      "taux_reussite": 0.75,
      "dernier_passage": "2026-11-04T10:30:00Z"
    },
    "conteneurs-dockerfile": {
      "taux_reussite": 0.55,
      "dernier_passage": "2026-11-03T14:00:00Z"
    }
  },
  "xp_total": 480,
  "niveau": 5,
  "xp_niveau_actuel": 180,
  "xp_pour_niveau_suivant": 1149
}
```

---

## 5. Architecture des Composants UI

### Les 3 vues principales

```
App.jsx  (React Router)
├── /                →  DashboardView.jsx      (Tableau de bord)
├── /quiz/:moduleId  →  QuizView.jsx           (Session QCM)
└── /lexique         →  LexiconView.jsx        (Dictionnaire)
```

---

### 5.1 QuizView — Interface QCM

**Layout exact (d'après maquettes fournies) :**

```
┌────────────────────────┬──────────────────────────────────────────┐
│  SIDEBAR (w-72)        │   ZONE CENTRALE                          │
│  fond : #0F172A        │   fond : blanc / gris très clair         │
│                        │                                          │
│  >_ Linux Master       │   Que représente le symbole ~ ?          │
│                        │   (titre h2 bold)                        │
│  PROGRESSION           │                                          │
│  3 / 20                │   ┌─────────────────────────────────┐    │
│  ████░░░░ (bleu)       │   │  Racine du système              │    │
│                        │   └─────────────────────────────────┘    │
│                        │   ┌─────────────────────────────────┐    │
│  [💡 Astuce] ← bouton  │   │  Dossier parent                 │    │
│   (cliquable, révèle   │   └─────────────────────────────────┘    │
│    le texte inline)    │   ┌─────────────────────────────────┐    │
│                        │   │  Répertoire personnel (Home) ✅ │ ← vert
│                        │   └─────────────────────────────────┘    │
│                        │   ┌─────────────────────────────────┐    │
│                        │   │  /home/utilisateur              │    │
│                        │   └─────────────────────────────────┘    │
│                        │                                          │
│                        │   ✅ Excellente réponse !                 │
│                        │   C'est un raccourci qui pointe vers...  │
│                        │                                          │
│                        │             [Question Suivante →]        │
└────────────────────────┴──────────────────────────────────────────┘
```

**États des 4 cadres de réponse :**

| État | Fond | Bordure | Icône | Texte |
|---|---|---|---|---|
| Neutre (non cliqué) | blanc / gris-50 | gris-200 | — | gris-700 |
| Hover | gris-100 | gris-300 | — | gris-900 |
| Sélectionné correct | vert-50 | vert-500 | `CheckCircle` vert | vert-700 bold |
| Sélectionné incorrect | rouge-50 | rouge-500 | `XCircle` rouge | rouge-700 bold |
| Grisé (après sélection) | gris-50 | gris-100 | — | gris-400 |

**Comportement du bouton Astuce 💡 :**
- Affiché dans la sidebar en permanence
- Si `astuce` est absent de la question : bouton **grisé et non cliquable**
- Si `astuce` est présent : bouton **actif**, un clic révèle un encart "Astuce DevOps" animé (Framer Motion) directement dans la sidebar, en dessous du bouton
- L'astuce reste visible jusqu'à la question suivante

**Bouton "Question Suivante" :**
- Désactivé et grisé tant qu'aucune réponse n'est sélectionnée
- Actif et bleu après sélection d'une réponse

---

### 5.2 LexiconView — Lexique
- Barre de recherche full-text (filtre en temps réel sur `terme` + `definition`)
- Filtre par module/catégorie (pills : Tous / Linux / Git / Conteneurs / CI-CD / IaC / Kubernetes…)
- Carte par terme : définition, rôle CI/CD, exemple de code monospace, liens "Voir aussi" cliquables
- Navigation possible depuis les liens dans le feedback QCM (passage avec `state` via React Router)

---

### 5.3 DashboardView — Tableau de Bord
- **Carte XP & Niveau** : rang actuel, barre de progression vers le niveau suivant, XP total (voir système ci-dessous)
- **Zone Points faibles** : sous-modules avec taux < 70 %, triés par urgence, avec bouton "Réviser →"
- **Vue d'ensemble** : nombre de questions répondues, taux global, modules non commencés
- *(Graphique par module : à implémenter en phase ultérieure)*

---

### 5.4 Système XP & Niveaux

#### Principe
Plus le niveau est élevé, plus il est difficile d'atteindre le suivant. La courbe est **exponentielle** pour simuler une montée en compétence réaliste.

#### Formule XP
L'XP nécessaire pour passer du niveau `N` au niveau `N+1` :

```
XP_requis(N) = round(100 × N^1.8)
```

Exemples :
| Niveau actuel | XP pour passer au suivant | XP cumulé depuis niveau 1 |
|---|---|---|
| 1 | 100 | 100 |
| 5 | 1 149 | 2 798 |
| 10 | 3 981 | 16 376 |
| 20 | 13 195 | 88 965 |
| 35 | 36 239 | — |
| 50 | 95 288 | — |

#### Gains d'XP par action
| Action | XP gagné |
|---|---|
| Bonne réponse (1ère tentative) | +10 XP |
| Bonne réponse (tentative suivante) | +5 XP |
| Session complète (100 %) | +50 XP bonus |
| Session complète (≥ 80 %) | +20 XP bonus |
| Première fois sur un module | +30 XP bonus |

#### Titres par palier de niveaux
Le titre change automatiquement selon le niveau atteint. Objectif final : **"Légende du DevOps"**.

| Niveaux | Titre affiché | Ambiance |
|---|---|---|
| 1 – 3 | 🧑‍💻 Stagiaire DevOps | Début du parcours |
| 4 – 7 | 🔧 Junior DevOps | Les bases en place |
| 8 – 12 | ⚙️ DevOps Engineer | Autonome sur les pipelines |
| 13 – 18 | 🚀 DevOps Confirmé | Maîtrise opérationnelle |
| 19 – 25 | 🏗️ DevOps Senior | Architecte de solutions |
| 26 – 33 | 🔐 DevSecOps Expert | Sécurité et fiabilité intégrées |
| 34 – 42 | 🌐 Principal Engineer | Vision système complète |
| 43 – 49 | 🏆 Staff Engineer | Référent technique |
| 50 | ⚡ Légende du DevOps | Niveau maximum — titre final |

> **Affichage UI** : sur le Dashboard, la carte de niveau affiche : le titre en grand, le niveau (ex: `Niv. 12`), l'XP actuel / XP requis pour le niveau suivant, et une barre de progression animée. Au passage d'un niveau, une animation de célébration se déclenche (Framer Motion).

---

## 6. Roadmap — État d'Avancement

### 🏗 Phase 0 — Fondations
- [ ] Initialisation du projet (Vite + React + Tailwind + Electron)
- [ ] Configuration `vite.config.js` avec les plugins Electron
- [ ] Configuration `electron/main.js` (fenêtre, IPC, chargement de `dataApp.json`)
- [ ] Configuration `electron/preload.js` (bridge sécurisé)
- [ ] Mise en place du router React (3 routes)
- [ ] Intégration de Zustand + middleware de persistance

### 🎨 Phase 1 — Interface QCM
- [ ] `QuizView.jsx` : layout sidebar foncée + zone centrale
- [ ] `QuestionCard.jsx` : affichage de la question et des 4 choix
- [ ] `AnswerChoice.jsx` : composant de choix avec 4 états (neutre / hover / correct / incorrect)
- [ ] `FeedbackPanel.jsx` : message de correction + lien lexique
- [ ] `SidebarQuiz.jsx` : progression + bouton Astuce 💡 (cliquable)
- [ ] `TipPanel.jsx` : encart astuce animé (révélé sur clic, absent si pas d'astuce)
- [ ] `useQuiz.js` : logique de navigation entre questions
- [ ] Sauvegarde du résultat dans electron-store via IPC

### 📖 Phase 2 — Lexique
- [ ] `LexiconView.jsx` : layout avec recherche et filtres par module
- [ ] `LexiconCard.jsx` : carte de définition complète
- [ ] Recherche full-text en temps réel
- [ ] Navigation depuis les liens du feedback QCM

### 📊 Phase 3 — Tableau de Bord
- [ ] `DashboardView.jsx` : layout général
- [ ] `StreakCard.jsx` : compteur de jours + XP
- [ ] `ModuleProgressChart.jsx` : barres de progression par module avec badge priorité
- [ ] `WeakPointsPanel.jsx` : détection automatique des sous-modules < 70 %
- [ ] Calcul des stats depuis les données electron-store

### 📦 Phase 4 — Packaging & Distribution
- [ ] Configuration `electron-builder` (`.exe` Windows, `.dmg` macOS)
- [ ] Icône de l'application
- [ ] `dataApp.json` embarqué dans le build final
- [ ] Tests de l'application packagée

### 🚀 Phase 5 — Contenu `dataApp.json`
- [ ] Linux — Fondamentaux : 30 questions min.
- [ ] Linux — Parcours B0-B6 : 20 questions min.
- [ ] Git : 20 questions min.
- [ ] Culture DevOps : 15 questions min.
- [ ] Conteneurs — Fondamentaux : 30 questions min.
- [ ] Conteneurs — Compléments : 15 questions min.
- [ ] Scripting Bash/Python : 20 questions min.
- [ ] Réseau : 25 questions min.
- [ ] Cloud / Azure : 20 questions min.
- [ ] CI/CD + GitLab CI Volet 1 : 30 questions min.
- [ ] GitLab CI Volet 2 & 3 : 15 questions min.
- [ ] IaC + Terraform : 30 questions min.
- [ ] Ansible : 15 questions min.
- [ ] Kubernetes : 25 questions min.
- [ ] Observabilité : 20 questions min.
- [ ] SRE / Platform / Dépannage : 15 questions min.
- [ ] Lexique : 80 termes min.

---

## 7. Conventions de Code

| Convention | Règle |
|---|---|
| **Nommage composants** | PascalCase (`AnswerChoice.jsx`) |
| **Nommage hooks** | camelCase préfixé `use` (`useQuiz.js`) |
| **Nommage store** | camelCase suffixé `Store` (`statsStore.js`) |
| **IDs modules** | kebab-case (`conteneurs-fondamentaux`) |
| **IDs questions** | `q-{module_id_court}-{NNN}` (ex: `q-conteneurs-001`) |
| **IDs sous-modules** | `{module_id}-{court}` (ex: `conteneurs-bases`) |
| **IDs lexique** | kebab-case du terme (ex: `docker-compose`) |
| **Nombre de choix** | Toujours exactement **4 choix** par question (`a`, `b`, `c`, `d`) |
| **Tailwind** | Classes utilitaires uniquement, animations via Framer Motion |
| **Communication Electron** | Toujours via IPC nommé (`ipcRenderer.invoke('load-data')`) |

---

*Dernière mise à jour : 2026-11-04 — Phase 0 non démarrée*
