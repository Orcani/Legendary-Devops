#!/usr/bin/env bash
# Copie le projet (dossier Windows) vers le dépôt Git (WSL) puis crée un commit.
# À lancer depuis WSL :
#   bash /mnt/c/Users/delph/.gemini/antigravity/scratch/devops-quiz/scripts/transfert-vers-git.sh
# Options :
#   --depot <chemin>    dépôt cible (défaut : ~/Side_projects/Legendary-Devops)
#   --message "<texte>" message du commit
#   --miroir            supprime aussi dans le dépôt les fichiers retirés du projet
set -euo pipefail

SOURCE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEPOT="$HOME/Side_projects/Legendary-Devops"
MESSAGE="Import du projet Legendary DevOps (phases 0 à 4)"
MIROIR=""
while [ $# -gt 0 ]; do
  case "$1" in
    --depot) DEPOT="$2"; shift 2 ;;
    --message) MESSAGE="$2"; shift 2 ;;
    --miroir) MIROIR="--delete"; shift ;;
    *) echo "Option inconnue : $1"; exit 1 ;;
  esac
done

[ -d "$DEPOT/.git" ] || { echo "✖ $DEPOT n'est pas un dépôt Git (dossier .git absent)."; exit 1; }
command -v rsync >/dev/null || { echo "✖ rsync manquant : sudo apt install rsync"; exit 1; }

echo "→ Copie de $SOURCE"
echo "  vers   $DEPOT"
# Dossiers générés ou propres à la machine : jamais copiés (node_modules se réinstalle avec npm install).
rsync -a $MIROIR \
  --exclude '.git/' --exclude 'node_modules/' --exclude 'dist/' --exclude 'dist-electron/' \
  --exclude 'release/' --exclude '.test-artifacts/' --exclude '*.log' \
  "$SOURCE/" "$DEPOT/"

cd "$DEPOT"
git add -A
if git diff --cached --quiet; then
  echo "✔ Rien de nouveau à enregistrer : le dépôt est déjà à jour."
  exit 0
fi
echo "→ Fichiers enregistrés :"
git status --short | head -40
if ! git config user.email >/dev/null; then
  echo "✖ Git ne connaît pas encore votre identité. Lancez une fois :"
  echo "    git config --global user.name \"Votre nom\""
  echo "    git config --global user.email \"votre@adresse\""
  echo "  puis relancez ce script."
  exit 1
fi
git commit -q -m "$MESSAGE"
echo "✔ Commit créé : $(git log -1 --oneline)"
echo "  Pour l'envoyer sur le dépôt distant : cd $DEPOT && git push"
