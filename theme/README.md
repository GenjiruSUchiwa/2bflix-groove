# Thème Jellyfin

Pour Jellyfin web 12.1, mise en page « Bureau » (l'interface moderne par défaut).

| Fichier | Rôle |
| --- | --- |
| `groove.css` | Le style : palette MUI (`--jf-*`), barre du haut, cartes, médiathèques, fiches, lecteur, fenêtres, connexion. |
| `groove.js` | Colonne « Médiathèques », bannière d'accueil, rangées par plateforme, teinte des fiches tirée de l'affiche, désactivation d'Abyss pour les comptes qui ont Groove. |

## Installation (recommandée)

Prérequis : le plugin **JavaScript Injector** et une clé API (Tableau de bord > Clés API).

```sh
# 1. Assembler : CSS embarqué + comptes ciblés (identifiants Jellyfin, sans argument = tout le monde)
node tools/build.mjs 7bef212a6cf245818e9ee53cd2d83725

# 2. Publier dans JavaScript Injector (la configuration précédente est sauvegardée dans dist/)
JELLYFIN_URL=https://mon-serveur JELLYFIN_API_KEY=xxxx node tools/deploy.mjs

# Retirer le thème
JELLYFIN_URL=https://mon-serveur JELLYFIN_API_KEY=xxxx node tools/deploy.mjs --remove
```

Aucun redémarrage n'est nécessaire : rechargez Jellyfin dans le navigateur.

Pourquoi un script et pas le « CSS personnalisé » de l'utilisateur ? Dans Jellyfin 12.1, ce CSS est enregistré dans le navigateur (localStorage), pas sur le serveur : il faudrait le coller sur chaque appareil. Le script, lui, est servi par le serveur à tous les navigateurs et n'applique le CSS qu'aux comptes listés.

## Installation manuelle (un seul navigateur)

1. Ajoutez `groove.js` dans JavaScript Injector (« Requires authentication » coché).
2. Collez `groove.css` dans Préférences > Affichage > CSS personnalisé.

## Ce que le thème ne couvre pas encore

- Les applications natives (Android TV, Swiftfin, Streamyfin) : elles n'utilisent pas l'interface web.
- Le tableau de bord d'administration : il reçoit seulement la palette.
- La mise en page « Bureau (ancienne) » : non testée.
