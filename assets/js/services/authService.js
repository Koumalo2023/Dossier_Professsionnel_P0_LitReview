/**
 * Service d'authentification pour gérer la connexion, l'inscription et la session utilisateur
 */
export class AuthService {
    /**
     * Vérifie si un utilisateur est connecté
     */
    static isAuthenticated() {
        return !!localStorage.getItem(this.TOKEN_KEY);
    }
    /**
     * Récupère le token JWT stocké
     */
    static getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    }
    /**
     * Récupère l'ID de l'utilisateur connecté
     */
    static getUserId() {
        const userId = localStorage.getItem(this.USER_ID_KEY);
        return userId ? parseInt(userId, 10) : null;
    }
    /**
     * Récupère le nom d'utilisateur de l'utilisateur connecté
     */
    static getUsername() {
        return localStorage.getItem(this.USERNAME_KEY);
    }
    /**
     * Enregistre les informations d'authentification
     */
    static setAuthInfo(token, userId, username) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_ID_KEY, userId.toString());
        localStorage.setItem(this.USERNAME_KEY, username);
    }
    /**
     * Supprime les informations d'authentification (déconnexion)
     */
    static clearAuthInfo() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_ID_KEY);
        localStorage.removeItem(this.USERNAME_KEY);
    }
    /**
     * Vérifie les identifiants de connexion
     */
    static async login(username, password) {
        try {
            // Dans un environnement réel, cette requête serait envoyée à un serveur d'authentification
            // Pour JSON Server, nous simulons l'authentification en recherchant l'utilisateur
            const response = await fetch(`http://localhost:3000/users?username=${username}`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const users = await response.json();
            if (users.length === 0) {
                throw new Error('Nom d\'utilisateur ou mot de passe incorrect');
            }
            const user = users[0];
            // Vérification du mot de passe (dans un environnement réel, le mot de passe serait haché)
            if (user.password !== password) {
                throw new Error('Nom d\'utilisateur ou mot de passe incorrect');
            }
            // Générer un token JWT simulé (dans un environnement réel, cela serait fait côté serveur)
            const token = this.generateSimulatedJWT(user.id, user.username);
            // Stocker les informations d'authentification
            this.setAuthInfo(token, user.id, user.username);
            return {
                token,
                userId: user.id,
                username: user.username
            };
        }
        catch (error) {
            console.error('Erreur lors de la connexion:', error);
            throw error;
        }
    }
    /**
     * Inscrit un nouvel utilisateur
     */
    static async register(username, password) {
        try {
            // Vérifier si le nom d'utilisateur existe déjà
            const checkResponse = await fetch(`http://localhost:3000/users?username=${username}`);
            if (!checkResponse.ok) {
                throw new Error(`Erreur HTTP: ${checkResponse.status}`);
            }
            const existingUsers = await checkResponse.json();
            if (existingUsers.length > 0) {
                throw new Error('Ce nom d\'utilisateur est déjà utilisé');
            }
            // Créer le nouvel utilisateur
            const createResponse = await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password,
                    follows_user: []
                })
            });
            if (!createResponse.ok) {
                throw new Error(`Erreur HTTP: ${createResponse.status}`);
            }
            const newUser = await createResponse.json();
            // Générer un token JWT simulé
            const token = this.generateSimulatedJWT(newUser.id, newUser.username);
            // Stocker les informations d'authentification
            this.setAuthInfo(token, newUser.id, newUser.username);
            return {
                token,
                userId: newUser.id,
                username: newUser.username
            };
        }
        catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            throw error;
        }
    }
    /**
     * Déconnecte l'utilisateur
     */
    static logout() {
        this.clearAuthInfo();
    }
    /**
     * Génère un JWT simulé pour l'authentification
     * Note: Dans un environnement réel, cela serait fait côté serveur avec une bibliothèque JWT appropriée
     */
    static generateSimulatedJWT(userId, username) {
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({
            sub: userId,
            name: username,
            iat: Math.floor(Date.now() / 1000),
            exp: Math.floor(Date.now() / 1000) + (60 * 60) // Expire dans 1 heure
        }));
        const signature = btoa(`${header}.${payload}`); // Simulé, pas une vraie signature cryptographique
        return `${header}.${payload}.${signature}`;
    }
}
AuthService.TOKEN_KEY = 'litreview_auth_token';
AuthService.USER_ID_KEY = 'litreview_user_id';
AuthService.USERNAME_KEY = 'litreview_username';
//# sourceMappingURL=authService.js.map