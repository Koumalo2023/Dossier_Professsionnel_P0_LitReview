# Étape 1 : construire les fichiers TypeScript et SCSS
FROM node:20 AS builder

WORKDIR /app

COPY . .

# Installer les dépendances nécessaires
RUN npm install -g typescript sass json-server

# Compiler les fichiers TypeScript et SCSS
RUN tsc && sass assets/scss/main.scss:assets/css/main.css

# Étape 2 : image finale 
FROM node:20

WORKDIR /app

COPY --from=builder /app /app

# Installer json-server globalement
RUN npm install -g json-server

# Installer un serveur HTTP statique
RUN npm install -g http-server

EXPOSE 3000
EXPOSE 8000

# Lancer les deux serveurs
CMD sh -c "json-server --watch server/db.json --port 3000 & http-server . -p 8000 & wait"
