# Exigences du projet LITReview

## Résumé du projet
LITReview est une application web permettant aux utilisateurs de demander et publier des critiques de livres ou d'articles. L'application doit être structurée selon le modèle MVC sans utiliser de framework lourd.

## Exigences fonctionnelles

### Gestion des utilisateurs
- Inscription avec nom d'utilisateur et mot de passe
- Connexion et déconnexion
- Suivi d'autres utilisateurs par leur nom
- Visualisation de la liste des utilisateurs suivis

### Gestion des tickets
- Création de tickets pour demander des critiques de livres/articles
- Modification et suppression de ses propres tickets
- Ajout d'images aux tickets
- Affichage des tickets dans un flux

### Gestion des critiques
- Création de critiques en réponse à des tickets existants
- Création de critiques directes (avec création simultanée d'un ticket)
- Modification et suppression de ses propres critiques
- Attribution d'une note (de 0 à 5 étoiles) aux critiques
- Blocage de la création de critiques multiples sur un même ticket par un utilisateur

### Flux et affichage
- Affichage d'un flux personnalisé contenant les billets et critiques des abonnements
- Tri antéchronologique du flux (du plus récent au plus ancien)
- Filtrage du flux pour n'afficher que les contenus pertinents (personnes suivies + contenus personnels)
- Affichage séparé des critiques en réponse aux tickets de l'utilisateur

## Exigences techniques

### Frontend
- TypeScript pour la logique
- SCSS compilé en CSS pour les styles
- HTML pour la structure
- Fetch API pour les requêtes au backend
- Pas de frameworks comme React, Angular ou Vue
- Pas de Bootstrap

### Backend
- JSON Server simulant une API REST
- Fichier db.json pour stocker les données
- Authentification via JWT stocké en localStorage
- Pas de Node.js ou Express

### Modèle de données
- Users: { id, username, password, follows_user[] }
- Ticket: { id, title, userId, description, image, time_created }
- Review: { id, ticketId, userId, rating, content, headline, time_created }

## Charte graphique

### Couleurs principales
- Rouge Orangé Doux (#EB6864)
- Vert Frais (#22B24C)
- Orange Vif (#F57A00)

### Couleurs secondaires
- Cyan Foncé (#336699)
- Jaune Vif (#F5E625)
- Violet Moyen (#6F42C1)
- Rose Vif (#E83E8C)

### Couleurs de texte
- Blanc Cassé (#F8F9FA) - pour fonds sombres
- Gris Anthracite (#212529) - titre/texte principal
- Gris Moyen (#ADB5BD) - texte secondaire
- Gris Clair (#DEE2E6) - bordures/éléments discrets
- Blanc Pur (#FFFFFF) - texte sur couleurs vives

### Typographie
- Police principale: Montserrat
- Styles de texte:
  - H1 Semibold/28px
  - H2 Semibold/24px
  - H3 Semibold/18px
  - Body/Semibold/12px
  - Body/Medium/12px
  - Body/Regular/12px

## Autres exigences
- Interface propre et minimaliste respectant les wireframes
- Respect des bonnes pratiques de développement
- README détaillé pour l'installation et le lancement
