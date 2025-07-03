# Souqly Frontend

Bienvenue sur le frontend React Native de Souqly !

## Documentation

- [Guide de configuration](documentation/CONFIGURATION.md)
- [Résumé de la migration du thème](documentation/THEME_MIGRATION_SUMMARY.md)
- [Guide d'authentification JWT](documentation/JWT_AUTHENTICATION.md)
- [Changelog](documentation/CHANGELOG.md)
- [Index de la documentation](documentation/index.md)

## Démarrage rapide

1. Installez les dépendances :
   ```bash
   npm install
   ```
2. Lancez le projet :
   ```bash
   npm start
   ```

## Structure du projet

- `app/` : Entrée Expo
- `components/` : Composants réutilisables
- `constants/` : Fichiers de configuration et couleurs
- `contexts/` : Contextes React (auth, thème, etc.)
- `navigation/` : Navigations stack et tab
- `screens/` : Pages principales de l'application
- `services/` : Accès API et logique métier
- `documentation/` : Guides et documentation technique

## Thème
Le projet supporte le mode clair et sombre grâce au contexte de thème. Voir [Résumé de la migration du thème](documentation/THEME_MIGRATION_SUMMARY.md).

## Authentification
Voir [Guide d'authentification JWT](documentation/JWT_AUTHENTICATION.md).

---

Pour toute question, consultez la documentation ou ouvrez une issue sur le dépôt Github. 