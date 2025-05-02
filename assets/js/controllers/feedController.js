import { HtmlGenerator } from '../utils/htmlGenerator.js';
import { UserModel } from '../models/user.js';
import { TicketModel } from '../models/ticket.js';
import { ReviewModel } from '../models/review.js';
import { AuthService } from '../services/authService.js';
export class FeedController {
    constructor() {
        this.userModel = new UserModel();
        this.ticketModel = new TicketModel();
        this.reviewModel = new ReviewModel();
        // Écouter les événements d'authentification
        document.addEventListener('auth:login', this.handleAuthEvent.bind(this));
        document.addEventListener('auth:register', this.handleAuthEvent.bind(this));
        document.addEventListener('auth:logout', this.handleLogout.bind(this));
        // Écouter les événements de navigation
        document.addEventListener('navigation:feed', this.showFeedPage.bind(this));
        document.addEventListener('navigation:posts', this.showPostsPage.bind(this));
        // Écouter les événements de création/modification/suppression
        document.addEventListener('ticket:created', this.handleContentUpdated.bind(this));
        document.addEventListener('ticket:updated', this.handleContentUpdated.bind(this));
        document.addEventListener('ticket:deleted', this.handleContentUpdated.bind(this));
        document.addEventListener('review:created', this.handleContentUpdated.bind(this));
        document.addEventListener('review:updated', this.handleContentUpdated.bind(this));
        document.addEventListener('review:deleted', this.handleContentUpdated.bind(this));
    }
    /**
     * Gère les événements d'authentification
     */
    handleAuthEvent() {
        // Initialiser le flux après connexion
        this.showFeedPage();
    }
    /**
     * Gère la déconnexion
     */
    handleLogout() {
        // Nettoyer les ressources si nécessaire
    }
    /**
     * Gère les mises à jour de contenu
     */
    handleContentUpdated() {
        // Rafraîchir le flux si c'est la page actuelle
        const mainContainer = document.getElementById('main-container');
        if (mainContainer && mainContainer.querySelector('.feed-container')) {
            this.showFeedPage();
        }
    }
    /**
     * Affiche la page du flux
     */
    async showFeedPage() {
        const mainContainer = document.getElementById('main-container');
        if (!mainContainer)
            return;
        const userId = AuthService.getUserId();
        if (!userId) {
            document.dispatchEvent(new CustomEvent('auth:logout'));
            return;
        }
        try {
            // Récupérer l'utilisateur actuel
            const currentUser = await this.userModel.getUserById(userId);
            // Récupérer les tickets et critiques pour le flux
            const tickets = await this.ticketModel.getTicketsForFeed(userId, currentUser.follows_user);
            const reviews = await this.reviewModel.getReviewsForFeed(userId, currentUser.follows_user);
            // Créer un tableau combiné de tickets et critiques
            const combinedItems = [];
            // Ajouter les tickets
            for (const ticket of tickets) {
                const user = await this.userModel.getUserById(ticket.userId);
                combinedItems.push({
                    type: 'ticket',
                    item: ticket,
                    user
                });
            }
            // Ajouter les critiques
            for (const review of reviews) {
                const ticket = await this.ticketModel.getTicketById(review.ticketId);
                const user = await this.userModel.getUserById(review.userId);
                combinedItems.push({
                    type: 'review',
                    item: review,
                    relatedItem: ticket,
                    user
                });
            }
            // Trier par date (du plus récent au plus ancien)
            combinedItems.sort((a, b) => {
                const dateA = new Date(a.item.time_created).getTime();
                const dateB = new Date(b.item.time_created).getTime();
                return dateB - dateA;
            });
            let html = '<header>';
            html += '<div class="container">';
            html += '<div class="nav">';
            html += '<div class="nav-logo">LITReview</div>';
            html += '<ul class="nav-links">';
            html += '<li><a href="#" class="active" id="nav-feed">Flux</a></li>';
            html += '<li><a href="#" id="nav-posts">Posts</a></li>';
            html += '<li><a href="#" id="nav-subscriptions">Abonnements</a></li>';
            html += '<li><a href="#" id="nav-logout">Se déconnecter</a></li>';
            html += '</ul>';
            html += '</div>';
            html += '</div>';
            html += '</header>';
            html += '<div class="container feed-container">';
            html += '<div class="feed-header">';
            html += '<h2>Flux</h2>';
            html += '<div class="feed-actions">';
            html += '<button id="create-ticket-btn" class="btn btn-primary">Demander une critique</button>';
            html += '<button id="create-review-btn" class="btn btn-success">Créer une critique</button>';
            html += '</div>';
            html += '</div>';
            html += '<div class="feed-filter">';
            html += '<label>';
            html += '<input type="checkbox" id="filter-checkbox" ' + (localStorage.getItem('feed_filter') === 'true' ? 'checked' : '') + '>';
            html += 'Bloquer les critiques aux tickets si un utilisateur a déjà posté une critique en réponse';
            html += '</label>';
            html += '</div>';
            html += '<div id="feed-content">';
            html += combinedItems.length > 0 ? HtmlGenerator.generateFeedItems(combinedItems, userId) : '<p class="text-muted">Aucun contenu à afficher. Suivez d\'autres utilisateurs ou créez du contenu pour voir apparaître des éléments dans votre flux.</p>';
            html += '</div>';
            html += '</div>';
            mainContainer.innerHTML = html;
            // Ajouter les écouteurs d'événements
            this.addFeedPageEventListeners();
        }
        catch (error) {
            console.error('Erreur lors du chargement du flux:', error);
            let html = '<header>';
            html += '<div class="container">';
            html += '<div class="nav">';
            html += '<div class="nav-logo">LITReview</div>';
            html += '<ul class="nav-links">';
            html += '<li><a href="#" class="active" id="nav-feed">Flux</a></li>';
            html += '<li><a href="#" id="nav-posts">Posts</a></li>';
            html += '<li><a href="#" id="nav-subscriptions">Abonnements</a></li>';
            html += '<li><a href="#" id="nav-logout">Se déconnecter</a></li>';
            html += '</ul>';
            html += '</div>';
            html += '</div>';
            html += '</header>';
            html += '<div class="container">';
            html += '<div class="alert alert-danger">';
            html += 'Une erreur est survenue lors du chargement du flux. Veuillez réessayer.';
            html += '</div>';
            html += '</div>';
            mainContainer.innerHTML = html;
            // Ajouter les écouteurs d'événements de navigation
            this.addNavigationEventListeners();
        }
    }
    /**
     * Affiche la page des posts de l'utilisateur
     */
    async showPostsPage() {
        const mainContainer = document.getElementById('main-container');
        if (!mainContainer)
            return;
        const userId = AuthService.getUserId();
        if (!userId) {
            document.dispatchEvent(new CustomEvent('auth:logout'));
            return;
        }
        try {
            // Récupérer les tickets et critiques de l'utilisateur
            const userTickets = await this.ticketModel.getTicketsByUserId(userId);
            const userReviews = await this.reviewModel.getReviewsByUserId(userId);
            // Récupérer les tickets associés aux critiques
            const ticketsForReviews = await Promise.all(userReviews.map(review => this.ticketModel.getTicketById(review.ticketId)));
            let html = '<header>';
            html += '<div class="container">';
            html += '<div class="nav">';
            html += '<div class="nav-logo">LITReview</div>';
            html += '<ul class="nav-links">';
            html += '<li><a href="#" id="nav-feed">Flux</a></li>';
            html += '<li><a href="#" class="active" id="nav-posts">Posts</a></li>';
            html += '<li><a href="#" id="nav-subscriptions">Abonnements</a></li>';
            html += '<li><a href="#" id="nav-logout">Se déconnecter</a></li>';
            html += '</ul>';
            html += '</div>';
            html += '</div>';
            html += '</header>';
            html += '<div class="container">';
            html += '<h2>Vos posts</h2>';
            html += '<div id="user-posts">';
            html += HtmlGenerator.generateUserPosts(userTickets, userReviews, ticketsForReviews);
            html += '</div>';
            html += '</div>';
            mainContainer.innerHTML = html;
            // Ajouter les écouteurs d'événements
            this.addPostsPageEventListeners();
        }
        catch (error) {
            console.error('Erreur lors du chargement des posts:', error);
            let html = '<header>';
            html += '<div class="container">';
            html += '<div class="nav">';
            html += '<div class="nav-logo">LITReview</div>';
            html += '<ul class="nav-links">';
            html += '<li><a href="#" id="nav-feed">Flux</a></li>';
            html += '<li><a href="#" class="active" id="nav-posts">Posts</a></li>';
            html += '<li><a href="#" id="nav-subscriptions">Abonnements</a></li>';
            html += '<li><a href="#" id="nav-logout">Se déconnecter</a></li>';
            html += '</ul>';
            html += '</div>';
            html += '</div>';
            html += '</header>';
            html += '<div class="container">';
            html += '<div class="alert alert-danger">';
            html += 'Une erreur est survenue lors du chargement de vos posts. Veuillez réessayer.';
            html += '</div>';
            html += '</div>';
            mainContainer.innerHTML = html;
            // Ajouter les écouteurs d'événements de navigation
            this.addNavigationEventListeners();
        }
    }
    /**
     * Ajoute les écouteurs d'événements pour la page du flux
     */
    addFeedPageEventListeners() {
        const createTicketBtn = document.getElementById('create-ticket-btn');
        const createReviewBtn = document.getElementById('create-review-btn');
        const createReviewForTicketBtns = document.querySelectorAll('.create-review-for-ticket-btn');
        const filterCheckbox = document.getElementById('filter-checkbox');
        const navLogout = document.getElementById('nav-logout');
        const navPosts = document.getElementById('nav-posts');
        const navSubscriptions = document.getElementById('nav-subscriptions');
        // Gérer le bouton de création de ticket
        createTicketBtn?.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('ticket:create'));
        });
        // Gérer le bouton de création de critique
        createReviewBtn?.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('review:create'));
        });
        // Gérer les boutons de création de critique pour un ticket
        createReviewForTicketBtns.forEach(button => {
            button.addEventListener('click', () => {
                const ticketId = parseInt(button.dataset.ticketId || '0', 10);
                if (ticketId) {
                    document.dispatchEvent(new CustomEvent('review:create-for-ticket', {
                        detail: { ticketId }
                    }));
                }
            });
        });
        // Gérer le filtre
        filterCheckbox?.addEventListener('change', () => {
            localStorage.setItem('feed_filter', filterCheckbox.checked.toString());
            this.showFeedPage();
        });
        // Navigation
        navLogout?.addEventListener('click', (event) => {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent('auth:logout'));
        });
        navPosts?.addEventListener('click', (event) => {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent('navigation:posts'));
        });
        navSubscriptions?.addEventListener('click', (event) => {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent('navigation:subscriptions'));
        });
    }
    /**
     * Ajoute les écouteurs d'événements pour la page des posts
     */
    addPostsPageEventListeners() {
        const editTicketBtns = document.querySelectorAll('.edit-ticket-btn');
        const deleteTicketBtns = document.querySelectorAll('.delete-ticket-btn');
        const editReviewBtns = document.querySelectorAll('.edit-review-btn');
        const deleteReviewBtns = document.querySelectorAll('.delete-review-btn');
        const navLogout = document.getElementById('nav-logout');
        const navFeed = document.getElementById('nav-feed');
        const navSubscriptions = document.getElementById('nav-subscriptions');
        // Gérer les boutons de modification de ticket
        editTicketBtns.forEach(button => {
            button.addEventListener('click', () => {
                const ticketId = parseInt(button.dataset.ticketId || '0', 10);
                if (ticketId) {
                    document.dispatchEvent(new CustomEvent('ticket:edit', {
                        detail: { ticketId }
                    }));
                }
            });
        });
        // Gérer les boutons de suppression de ticket
        deleteTicketBtns.forEach(button => {
            button.addEventListener('click', () => {
                const ticketId = parseInt(button.dataset.ticketId || '0', 10);
                if (ticketId) {
                    document.dispatchEvent(new CustomEvent('ticket:delete', {
                        detail: { ticketId }
                    }));
                }
            });
        });
        // Gérer les boutons de modification de critique
        editReviewBtns.forEach(button => {
            button.addEventListener('click', () => {
                const reviewId = parseInt(button.dataset.reviewId || '0', 10);
                if (reviewId) {
                    document.dispatchEvent(new CustomEvent('review:edit', {
                        detail: { reviewId }
                    }));
                }
            });
        });
        // Gérer les boutons de suppression de critique
        deleteReviewBtns.forEach(button => {
            button.addEventListener('click', () => {
                const reviewId = parseInt(button.dataset.reviewId || '0', 10);
                if (reviewId) {
                    document.dispatchEvent(new CustomEvent('review:delete', {
                        detail: { reviewId }
                    }));
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
        navSubscriptions?.addEventListener('click', (event) => {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent('navigation:subscriptions'));
        });
    }
    /**
     * Ajoute les écouteurs d'événements de navigation
     */
    addNavigationEventListeners() {
        const navLogout = document.getElementById('nav-logout');
        const navFeed = document.getElementById('nav-feed');
        const navPosts = document.getElementById('nav-posts');
        const navSubscriptions = document.getElementById('nav-subscriptions');
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
        navSubscriptions?.addEventListener('click', (event) => {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent('navigation:subscriptions'));
        });
    }
}
//# sourceMappingURL=feedController.js.map