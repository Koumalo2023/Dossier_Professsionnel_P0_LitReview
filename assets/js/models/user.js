/**
 * Classe pour gérer les opérations liées aux utilisateurs
 */
export class UserModel {
    constructor() {
        this.apiUrl = 'http://localhost:3000/users';
    }
    /**
     * Récupère tous les utilisateurs
     */
    async getAllUsers() {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Erreur lors de la récupération des utilisateurs:', error);
            throw error;
        }
    }
    /**
     * Récupère un utilisateur par son ID
     */
    async getUserById(id) {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error);
            throw error;
        }
    }
    /**
     * Récupère un utilisateur par son nom d'utilisateur
     */
    async getUserByUsername(username) {
        try {
            const response = await fetch(`${this.apiUrl}?username=${username}`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const users = await response.json();
            return users.length > 0 ? users[0] : null;
        }
        catch (error) {
            console.error(`Erreur lors de la récupération de l'utilisateur ${username}:`, error);
            throw error;
        }
    }
    /**
     * Crée un nouvel utilisateur
     */
    async createUser(user) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error('Erreur lors de la création de l\'utilisateur:', error);
            throw error;
        }
    }
    /**
     * Met à jour un utilisateur existant
     */
    async updateUser(id, userData) {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Erreur lors de la mise à jour de l'utilisateur ${id}:`, error);
            throw error;
        }
    }
    /**
     * Suit un autre utilisateur
     */
    async followUser(userId, targetUserId) {
        try {
            // Récupérer l'utilisateur actuel
            const user = await this.getUserById(userId);
            // Vérifier si l'utilisateur suit déjà la cible
            if (user.follows_user.includes(targetUserId)) {
                return user; // Déjà suivi, retourner l'utilisateur sans modification
            }
            // Ajouter l'ID de l'utilisateur cible à la liste des suivis
            const updatedFollows = [...user.follows_user, targetUserId];
            // Mettre à jour l'utilisateur
            return await this.updateUser(userId, { follows_user: updatedFollows });
        }
        catch (error) {
            console.error(`Erreur lors du suivi de l'utilisateur ${targetUserId}:`, error);
            throw error;
        }
    }
    /**
     * Ne plus suivre un utilisateur
     */
    async unfollowUser(userId, targetUserId) {
        try {
            // Récupérer l'utilisateur actuel
            const user = await this.getUserById(userId);
            // Filtrer l'ID de l'utilisateur cible de la liste des suivis
            const updatedFollows = user.follows_user.filter(id => id !== targetUserId);
            // Mettre à jour l'utilisateur
            return await this.updateUser(userId, { follows_user: updatedFollows });
        }
        catch (error) {
            console.error(`Erreur lors du désabonnement de l'utilisateur ${targetUserId}:`, error);
            throw error;
        }
    }
    /**
     * Récupère la liste des utilisateurs suivis par un utilisateur
     */
    async getFollowedUsers(userId) {
        try {
            // Récupérer l'utilisateur actuel
            const user = await this.getUserById(userId);
            // Si l'utilisateur ne suit personne, retourner un tableau vide
            if (user.follows_user.length === 0) {
                return [];
            }
            // Récupérer tous les utilisateurs suivis
            const followedUsers = await Promise.all(user.follows_user.map(id => this.getUserById(id)));
            return followedUsers;
        }
        catch (error) {
            console.error(`Erreur lors de la récupération des utilisateurs suivis par ${userId}:`, error);
            throw error;
        }
    }
    /**
     * Récupère la liste des utilisateurs qui suivent un utilisateur
     */
    async getFollowers(userId) {
        try {
            // Récupérer tous les utilisateurs
            const allUsers = await this.getAllUsers();
            // Filtrer les utilisateurs qui suivent l'utilisateur spécifié
            const followers = allUsers.filter(user => user.follows_user.includes(userId));
            return followers;
        }
        catch (error) {
            console.error(`Erreur lors de la récupération des abonnés de ${userId}:`, error);
            throw error;
        }
    }
}
//# sourceMappingURL=user.js.map