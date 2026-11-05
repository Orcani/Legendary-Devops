# Validation des parcours QCM

Vérification automatisée le 4 novembre 2026 :

- `npm test` : calcul des XP, bonus, niveaux, compteurs cumulés, validation, absence de double crédit, filtres et tirages.
- `npm run lint` : analyse des sources.
- `npm run build` : construction React, main Electron et preload CommonJS.
- `npm run test:electron` : parcours de l’interface réelle avec un profil temporaire.

Le test Electron termine un QCM Linux parfait (100 XP au premier passage), rejoue le QCM (60 XP supplémentaires), ferme réellement le processus, puis retrouve progression, thème et réponse d’un troisième QCM en cours. Il teste aussi le Codex sans quitter le QCM, la sauvegarde répétée du même identifiant et un payload invalide sans mutation.

Le chemin navigateur termine également des sessions, recharge la page et vérifie le cumul des compteurs. Un échec de sauvegarde est simulé ; le bilan ne s’affiche pas comme réussi avant la nouvelle tentative.

## Vérification manuelle

1. Lancer `npm run dev`.
2. Ouvrir Linux : consulter les sous-modules et choisir un QCM court, long ou un sous-module.
3. Répondre, ouvrir une fiche Codex et revenir au QCM : la réponse reste sélectionnée.
4. Changer de thème : sidebar, question, réponses, Codex et bilan suivent le même thème.
5. Terminer le QCM : vérifier le score, le détail des XP et la confirmation de sauvegarde.
6. Fermer et relancer l’application : vérifier XP et thème.
7. Commencer un autre QCM, répondre puis fermer l’application. Relancer le même QCM : retrouver la réponse.
8. Choisir le filtre « sous-modules déjà pratiqués » : seuls les sous-modules présents dans des sessions sauvegardées fournissent des questions.

Avec trois questions au total, les formats court et long ne se différencient pas forcément visuellement. Le plafond de dix questions est vérifié avec un catalogue de test plus grand.

Les tests ne valident pas les installateurs Windows/macOS : leur configuration appartient à la phase de distribution.
