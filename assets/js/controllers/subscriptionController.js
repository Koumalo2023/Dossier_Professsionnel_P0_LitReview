/**
 * Contrôleur pour la gestion des abonnements (suivre/ne plus suivre des utilisateurs)
 */
import { UserModel } from '../models/user.js';
import { AuthService } from '../services/authService.js';
export class SubscriptionController {
    constructor() {
        this.userModel = new UserModel();
        // Écouter les événements d'authentification
        document.addEventListener('auth:login', this.handleAuthEvent.bind(this));
        document.addEventListener('auth:register', this.handleAuthEvent.bind(this));
        document.addEventListener('auth:logout', this.handleLogout.bind(this));
    }
    /**
     * Gère les événements d'authentification
     */
    handleAuthEvent() {
        // Initialiser les fonctionnalités d'abonnement après connexion
        this.setupSubscriptionEventListeners();
    }
    /**
     * Gère la déconnexion
     */
    handleLogout() {
        // Nettoyer les ressources si nécessaire
    }
    /**
     * Configure les écouteurs d'événements pour les fonctionnalités d'abonnement
     */
    setupSubscriptionEventListeners() {
        // Écouteur pour le bouton de navigation vers les abonnements
        document.addEventListener('navigation:subscriptions', this.showSubscriptionsPage.bind(this));
    }
    /**
     * Affiche la page des abonnements
     */
    async showSubscriptionsPage() {
        const mainContainer = document.getElementById('main-container');
        if (!mainContainer)
            return;
        const userId = AuthService.getUserId();
        if (!userId) {
            document.dispatchEvent(new CustomEvent('auth:logout'));
            return;
        }
        try {
            // Récupérer les utilisateurs suivis
            const followedUsers = await this.userModel.getFollowedUsers(userId);
            // Récupérer les abonnés
            const followers = await this.userModel.getFollowers(userId);
            // Récupérer tous les utilisateurs pour la recherche
            const allUsers = await this.userModel.getAllUsers();
            mainContainer.innerHTML = `
                <header>
                    <div class="container">
                        <div class="nav">
                            <div class="nav-logo">LITReview</div>
                            <ul class="nav-links">
                                <li><a href="#" id="nav-feed">Flux</a></li>
                                <li><a href="#" id="nav-posts">Posts</a></li>
                                <li><a href="#" class="active" id="nav-subscriptions">Abonnements</a></li>
                                <li><a href="#" id="nav-logout">Se déconnecter</a></li>
                            </ul>
                        </div>
                    </div>
                </header>
                
                <div class="container">
                    <h2>Suivre d'autres utilisateurs</h2>
                    
                    <div class="subscription-form">
                        <div class="form-group">
                            <input type="text" id="search-username" class="form-control" placeholder="Nom d'utilisateur">
                        </div>
                        <button id="follow-button" class="btn btn-primary">Envoyer</button>
                        <div id="follow-error" class="alert alert-danger hidden mt-2"></div>
                        <div id="follow-success" class="alert alert-success hidden mt-2"></div>
                    </div>
                    
                    <div class="subscription-lists">
                        <div class="subscription-list">
                            <h3>Abonnements</h3>
                            <div id="followed-users-list">
                                ${followedUsers.length > 0
                ? followedUsers.map(user => `
                                        <div class="subscription-item">
                                            <span>${user.username}</span>
                                            <button class="btn btn-danger btn-sm unfollow-button" data-user-id="${user.id}">Désabonner</button>
                                        </div>
                                    `).join('')
                : '<p class="text-muted">Vous ne suivez aucun utilisateur.</p>'}
                            </div>
                        </div>
                        
                        <div class="subscription-list">
                            <h3>Abonnés</h3>
                            <div id="followers-list">
                                ${followers.length > 0
                ? followers.map(user => `
                                        <div class="subscription-item">
                                            <span>${user.username}</span>
                                        </div>
                                    `).join('')
                : '<p class="text-muted">Aucun utilisateur ne vous suit.</p>'}
                            </div>
                        </div>
                    </div>
                </div>
            `;
            // Ajouter les écouteurs d'événements
            this.addSubscriptionPageEventListeners(allUsers);
        }
        catch (error) {
            console.error('Erreur lors du chargement de la page d\'abonnements:', error);
            mainContainer.innerHTML = `
                <header>
                    <div class="container">
                        <div class="nav">
                            <div class="nav-logo">LITReview</div>
                            <ul class="nav-links">
                                <li><a href="#" id="nav-feed">Flux</a></li>
                                <li><a href="#" id="nav-posts">Posts</a></li>
                                <li><a href="#" class="active" id="nav-subscriptions">Abonnements</a></li>
                                <li><a href="#" id="nav-logout">Se déconnecter</a></li>
                            </ul>
                        </div>
                    </div>
                </header>
                
                <div class="container">
                    <div class="alert alert-danger">
                        Une erreur est survenue lors du chargement des abonnements. Veuillez réessayer.
                    </div>
                </div>
            `;
            // Ajouter les écouteurs d'événements de navigation
            this.addNavigationEventListeners();
        }
    }
    /**
     * Ajoute les écouteurs d'événements pour la page d'abonnements
     */
    addSubscriptionPageEventListeners(allUsers) {
        const followButton = document.getElementById('follow-button');
        const searchUsernameInput = document.getElementById('search-username');
        const unfollowButtons = document.querySelectorAll('.unfollow-button');
        const navLogout = document.getElementById('nav-logout');
        const navFeed = document.getElementById('nav-feed');
        const navPosts = document.getElementById('nav-posts');
        // Gérer le bouton de suivi
        followButton?.addEventListener('click', async () => {
            const username = searchUsernameInput.value.trim();
            await this.handleFollowUser(username, allUsers);
        });
        // Gérer la touche Entrée dans le champ de recherche
        searchUsernameInput?.addEventListener('keypress', async (event) => {
            if (event.key === 'Enter') {
                const username = searchUsernameInput.value.trim();
                await this.handleFollowUser(username, allUsers);
            }
        });
        // Gérer les boutons de désabonnement
        unfollowButtons.forEach(button => {
            button.addEventListener('click', async () => {
                const targetUserId = parseInt(button.dataset.userId || '0', 10);
                if (targetUserId) {
                    await this.handleUnfollowUser(targetUserId);
                }
            });
        });
        // Navigation
        navLogout?.addEventListener('click', (event) => {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent('auth:logout'));
        });
        navFeed?.addEventListener('click', (event) => {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent('navigation:feed'));
        });
        navPosts?.addEventListener('click', (event) => {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent('navigation:posts'));
        });
    }
    /**
     * Ajoute les écouteurs d'événements de navigation
     */
    addNavigationEventListeners() {
        const navLogout = document.getElementById('nav-logout');
        const navFeed = document.getElementById('nav-feed');
        const navPosts = document.getElementById('nav-posts');
        navLogout?.addEventListener('click', (event) => {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent('auth:logout'));
        });
        navFeed?.addEventListener('click', (event) => {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent('navigation:feed'));
        });
        navPosts?.addEventListener('click', (event) => {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent('navigation:posts'));
        });
    }
    /**
     * Gère le suivi d'un utilisateur
     */
    async handleFollowUser(username, allUsers) {
        const errorElement = document.getElementById('follow-error');
        const successElement = document.getElementById('follow-success');
        const userId = AuthService.getUserId();
        // Cacher les messages précédents
        errorElement?.classList.add('hidden');
        successElement?.classList.add('hidden');
        if (!username) {
            if (errorElement) {
                errorElement.textContent = 'Veuillez entrer un nom d\'utilisateur.';
                errorElement.classList.remove('hidden');
            }
            return;
        }
        if (!userId) {
            document.dispatchEvent(new CustomEvent('auth:logout'));
            return;
        }
        try {
            // Trouver l'utilisateur par son nom d'utilisateur
            const targetUser = allUsers.find(user => user.username === username);
            if (!targetUser) {
                throw new Error('Utilisateur non trouvé.');
            }
            // Vérifier que l'utilisateur ne tente pas de se suivre lui-même
            if (targetUser.id === userId) {
                throw new Error('Vous ne pouvez pas vous suivre vous-même.');
            }
            // Récupérer l'utilisateur actuel
            const currentUser = await this.userModel.getUserById(userId);
            // Vérifier si l'utilisateur suit déjà la cible
            if (currentUser.follows_user.includes(targetUser.id)) {
                throw new Error('Vous suivez déjà cet utilisateur.');
            }
            // Suivre l'utilisateur
            await this.userModel.followUser(userId, targetUser.id);
            // Afficher le message de succès
            if (successElement) {
                successElement.textContent = `Vous suivez maintenant ${targetUser.username}.`;
                successElement.classList.remove('hidden');
            }
            // Rafraîchir la page des abonnements
            setTimeout(() => {
                this.showSubscriptionsPage();
            }, 1500);
        }
        catch (error) {
            // Afficher l'erreur
            if (errorElement) {
                errorElement.textContent = error instanceof Error ? error.message : 'Une erreur est survenue.';
                errorElement.classList.remove('hidden');
            }
        }
    }
    /**
     * Gère le désabonnement d'un utilisateur
     */
    async handleUnfollowUser(targetUserId) {
        const userId = AuthService.getUserId();
        if (!userId) {
            document.dispatchEvent(new CustomEvent('auth:logout'));
            return;
        }
        try {
            // Récupérer l'utilisateur cible
            const targetUser = await this.userModel.getUserById(targetUserId);
            // Confirmer le désabonnement
            if (confirm(`Êtes-vous sûr de vouloir vous désabonner de ${targetUser.username} ?`)) {
                // Se désabonner de l'utilisateur
                await this.userModel.unfollowUser(userId, targetUserId);
                // Rafraîchir la page des abonnements
                this.showSubscriptionsPage();
            }
        }
        catch (error) {
            console.error('Erreur lors du désabonnement:', error);
            alert(error instanceof Error ? error.message : 'Une erreur est survenue lors du désabonnement.');
        }
    }
}
//# sourceMappingURL=subscriptionController.js.map