# LITReview - Application de critiques littéraires

## Présentation du projet

LITReview est une application web permettant aux utilisateurs de demander et publier des critiques de livres ou d'articles. Cette application est structurée selon le modèle MVC (Modèle-Vue-Contrôleur) sans utiliser de framework lourd.

L'application offre les fonctionnalités suivantes :
- Demander des critiques de livres ou d'articles en créant des billets
- Lire et publier des critiques
- Suivre d'autres utilisateurs
- Gérer son compte (inscription, connexion)
- Visualiser un flux personnalisé (billets et critiques des abonnements), trié antéchronologiquement

## Guide d'installation et d'exécution

### Prérequis

- Node.js (version 14 ou supérieure)
- npm (inclus avec Node.js)

### Installation

1. Clonez ou décompressez le projet dans un dossier de votre choix.

2. Ouvrez un terminal et naviguez jusqu'au dossier du projet.

3. Installez les dépendances nécessaires :

```bash
npm install -g typescript sass json-server
```

## Exécution de l'application

Pour exécuter l'application, vous devez lancer trois processus dans des terminaux différents :

### Terminal 1 : Compiler les fichiers TypeScript

```bash
tsc --watch
```

### Terminal 2 : Compiler les fichiers SCSS

```bash
sass --watch assets/scss/main.scss:assets/css/main.css
```

### Terminal 3 : Démarrer le serveur JSON

```bash
json-server --watch server/db.json --port 3000
```

### Terminal 4 : Démarrer un serveur HTTP

```bash
# Si vous avez Python installé
python -m http.server 8000

# OU si vous avez Node.js
npx http-server -p 8000
```

## Accès à l'application

Ouvrez votre navigateur et accédez à l'URL suivante :

```
http://localhost:8000
```

## Identifiants de connexion

Vous pouvez vous connecter avec les identifiants suivants :

- Utilisateur : admin
- Mot de passe : admin123

Ou créer votre propre compte via le formulaire d'inscription.

## Technologies utilisées

### Frontend
- TypeScript pour la logique
- SCSS compilé en CSS pour les styles
- HTML pour la structure
- Fetch API pour les requêtes au backend

### Backend
- JSON Server simulant une API REST
- Fichier db.json pour stocker les données
- Authentification via JWT stocké en localStorage

## Structure du projet

L'application suit l'architecture MVC (Modèle-Vue-Contrôleur) :

- **Modèles** : `/assets/ts/models/` - Gestion des données et logique métier
- **Vues** : Générées dynamiquement par les contrôleurs
- **Contrôleurs** : `/assets/ts/controllers/` - Gestion des interactions utilisateur
- **Services** : `/assets/ts/services/` - Services partagés (authentification, API)
- **Styles** : `/assets/scss/` - Styles SCSS organisés par composants

## Organigramme du projet

```
litreview/
├── index.html                  # Point d'entrée de l'application
├── assets/                     # Ressources statiques
│   ├── css/                    # Fichiers CSS compilés
│   ├── scss/                   # Fichiers SCSS source
│   │   ├── _variables.scss     # Variables (couleurs, typographie)
│   │   ├── _components.scss    # Styles des composants réutilisables
│   │   ├── _layout.scss        # Mise en page globale
│   │   └── main.scss           # Fichier principal important tous les autres
│   ├── js/                     # JavaScript compilé
│   ├── ts/                     # TypeScript source
│   │   ├── models/             # Modèles de données
│   │   │   ├── user.ts
│   │   │   ├── ticket.ts
│   │   │   └── review.ts
│   │   ├── views/              # Vues (génération du HTML)
│   │   │   ├── authView.ts
│   │   │   ├── feedView.ts
│   │   │   ├── ticketView.ts
│   │   │   ├── reviewView.ts
│   │   │   └── subscriptionView.ts
│   │   ├── controllers/        # Contrôleurs (logique métier)
│   │   │   ├── authController.ts
│   │   │   ├── feedController.ts
│   │   │   ├── ticketController.ts
│   │   │   ├── reviewController.ts
│   │   │   └── subscriptionController.ts
│   │   ├── services/           # Services (API, authentification)
│   │   │   ├── apiService.ts
│   │   │   └── authService.ts
│   │   └── app.ts              # Point d'entrée TypeScript
│   ├── fonts/                  # Police Montserrat
│   └── images/                 # Images statiques
├── server/                     # Configuration du serveur JSON
│   └── db.json                 # Base de données JSON
└── README.md                   # Documentation du projet
```

## Fonctionnalités

- Système d'authentification (connexion/inscription)
- Gestion des tickets (création, modification, suppression)
- Système de critiques (création, modification, suppression)
- Système d'abonnements (suivre/ne plus suivre des utilisateurs)
- Flux d'activité filtrable

## Remarques

- L'application utilise JSON Server comme backend simulé, ce qui signifie que les données sont stockées localement dans le fichier `server/db.json`.
- Les mots de passe ne sont pas hachés dans cette version de démonstration, ne pas utiliser en production.

## Licence

Ce projet est sous licence [À DÉFINIR]
