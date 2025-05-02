/**
 * Contrôleur pour la gestion des critiques (création, modification, suppression)
 */
import { Review, ReviewModel } from '../models/review.js';
import { Ticket, TicketModel } from '../models/ticket.js';
import { AuthService } from '../services/authService.js';
import { ApiService } from '../services/apiService.js';

export class ReviewController {
    private reviewModel: ReviewModel;
    private ticketModel: TicketModel;
    
    constructor() {
        this.reviewModel = new ReviewModel();
        this.ticketModel = new TicketModel();
        
        // Écouter les événements d'authentification
        document.addEventListener('auth:login', this.handleAuthEvent.bind(this));
        document.addEventListener('auth:register', this.handleAuthEvent.bind(this));
        document.addEventListener('auth:logout', this.handleLogout.bind(this));
    }
    
    /**
     * Gère les événements d'authentification
     */
    private handleAuthEvent(): void {
        // Initialiser les fonctionnalités de critique après connexion
        this.setupReviewEventListeners();
    }
    
    /**
     * Gère la déconnexion
     */
    private handleLogout(): void {
        // Nettoyer les ressources si nécessaire
    }
    
    /**
     * Configure les écouteurs d'événements pour les fonctionnalités de critique
     */
    private setupReviewEventListeners(): void {
        // Écouteur pour le bouton de création de critique
        const createReviewBtn = document.getElementById('create-review-btn');
        if (createReviewBtn) {
            createReviewBtn.addEventListener('click', this.showCreateReviewForm.bind(this));
        }
    }
    
    /**
     * Affiche le formulaire de création de critique (sans ticket associé)
     */
    public showCreateReviewForm(): void {
        const mainContainer = document.getElementById('main-container');
        if (!mainContainer) return;
        
        mainContainer.innerHTML = `
            <header>
                <div class="container">
                    <div class="nav">
                        <div class="nav-logo">LITReview</div>
                        <ul class="nav-links">
                            <li><a href="#" id="nav-feed">Flux</a></li>
                            <li><a href="#" id="nav-posts">Posts</a></li>
                            <li><a href="#" id="nav-subscriptions">Abonnements</a></li>
                            <li><a href="#" id="nav-logout">Se déconnecter</a></li>
                        </ul>
                    </div>
                </div>
            </header>
            
            <div class="container">
                <h2>Créer une critique</h2>
                
                <div class="form-container">
                    <form id="create-review-form">
                        <div class="card mb-4">
                            <div class="card-header">
                                <h3>Livre / Article</h3>
                            </div>
                            <div class="card-body">
                                <div class="form-group">
                                    <label for="ticket-title" class="form-label">Titre</label>
                                    <input type="text" id="ticket-title" class="form-control" required>
                                </div>
                                
                                <div class="form-group">
                                    <label for="ticket-description" class="form-label">Description</label>
                                    <textarea id="ticket-description" class="form-control" rows="3"></textarea>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Image</label>
                                    <div class="file-upload" id="ticket-image-upload">
                                        <div class="file-upload-icon">+</div>
                                        <div class="file-upload-text">Télécharger fichier</div>
                                    </div>
                                    <input type="file" id="ticket-image-input" accept="image/*" style="display: none;">
                                    <div id="ticket-image-preview" class="mt-2 hidden"></div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="card">
                            <div class="card-header">
                                <h3>Critique</h3>
                            </div>
                            <div class="card-body">
                                <div class="form-group">
                                    <label for="review-headline" class="form-label">Titre</label>
                                    <input type="text" id="review-headline" class="form-control" required>
                                </div>
                                
                                <div class="form-group">
                                    <label class="form-label">Note</label>
                                    <div class="rating-input">
                                        <div class="rating-option">
                                            <input type="radio" name="rating" id="rating-0" value="0">
                                            <label for="rating-0">0</label>
                                        </div>
                                        <div class="rating-option">
                                            <input type="radio" name="rating" id="rating-1" value="1">
                                            <label for="rating-1">1</label>
                                        </div>
                                        <div class="rating-option">
                                            <input type="radio" name="rating" id="rating-2" value="2">
                                            <label for="rating-2">2</label>
                                        </div>
                                        <div class="rating-option">
                                            <input type="radio" name="rating" id="rating-3" value="3">
                                            <label for="rating-3">3</label>
                                        </div>
                                        <div class="rating-option">
                                            <input type="radio" name="rating" id="rating-4" value="4">
                                            <label for="rating-4">4</label>
                                        </div>
                                        <div class="rating-option">
                                            <input type="radio" name="rating" id="rating-5" value="5" checked>
                                            <label for="rating-5">5</label>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="form-group">
                                    <label for="review-content" class="form-label">Commentaire</label>
                                    <textarea id="review-content" class="form-control" rows="5" required></textarea>
                                </div>
                            </div>
                        </div>
                        
                        <div id="review-error" class="alert alert-danger hidden mt-3"></div>
                        
                        <div class="text-right mt-3">
                            <button type="button" id="review-cancel-btn" class="btn btn-secondary">Annuler</button>
                            <button type="submit" class="btn btn-primary">Envoyer</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // Ajouter les écouteurs d'événements
        this.addReviewFormEventListeners();
    }
    
    /**
     * Affiche le formulaire de création de critique en réponse à un ticket
     */
    public async showCreateReviewForTicketForm(ticketId: number): Promise<void> {
        try {
            const ticket = await this.ticketModel.getTicketById(ticketId);
            const userId = AuthService.getUserId();
            
            // Vérifier si l'utilisateur a déjà posté une critique pour ce ticket
            const hasReviewed = await this.reviewModel.hasUserReviewedTicket(userId!, ticketId);
            if (hasReviewed) {
                throw new Error('Vous avez déjà posté une critique pour ce ticket.');
            }
            
            const mainContainer = document.getElementById('main-container');
            if (!mainContainer) return;
            
            mainContainer.innerHTML = `
                <header>
                    <div class="container">
                        <div class="nav">
                            <div class="nav-logo">LITReview</div>
                            <ul class="nav-links">
                                <li><a href="#" id="nav-feed">Flux</a></li>
                                <li><a href="#" id="nav-posts">Posts</a></li>
                                <li><a href="#" id="nav-subscriptions">Abonnements</a></li>
                                <li><a href="#" id="nav-logout">Se déconnecter</a></li>
                            </ul>
                        </div>
                    </div>
                </header>
                
                <div class="container">
                    <h2>Créer une critique</h2>
                    
                    <div class="form-container">
                        <form id="create-review-for-ticket-form">
                            <div class="card mb-4">
                                <div class="card-header">
                                    <h3>Vous êtes en train de poster en réponse à</h3>
                                </div>
                                <div class="card-body">
                                    <div class="ticket-card">
                                        <div class="ticket-header">
                                            <div>
                                                <p class="ticket-meta">${new Date(ticket.time_created).toLocaleString('fr-FR')}</p>
                                                <p><strong>${ticket.userId === userId ? 'Vous avez' : 'Un utilisateur a'} demandé une critique</strong></p>
                                            </div>
                                        </div>
                                        <h3>${ticket.title}</h3>
                                        <p>${ticket.description}</p>
                                        ${ticket.image ? `<img src="${ticket.image}" alt="${ticket.title}" class="ticket-image">` : ''}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="card">
                                <div class="card-header">
                                    <h3>Critique</h3>
                                </div>
                                <div class="card-body">
                                    <div class="form-group">
                                        <label for="review-headline" class="form-label">Titre</label>
                                        <input type="text" id="review-headline" class="form-control" required>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label">Note</label>
                                        <div class="rating-input">
                                            <div class="rating-option">
                                                <input type="radio" name="rating" id="rating-0" value="0">
                                                <label for="rating-0">0</label>
                                            </div>
                                            <div class="rating-option">
                                                <input type="radio" name="rating" id="rating-1" value="1">
                                                <label for="rating-1">1</label>
                                            </div>
                                            <div class="rating-option">
                                                <input type="radio" name="rating" id="rating-2" value="2">
                                                <label for="rating-2">2</label>
                                            </div>
                                            <div class="rating-option">
                                                <input type="radio" name="rating" id="rating-3" value="3">
                                                <label for="rating-3">3</label>
                                            </div>
                                            <div class="rating-option">
                                                <input type="radio" name="rating" id="rating-4" value="4">
                                                <label for="rating-4">4</label>
                                            </div>
                                            <div class="rating-option">
                                                <input type="radio" name="rating" id="rating-5" value="5" checked>
                                                <label for="rating-5">5</label>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="review-content" class="form-label">Commentaire</label>
                                        <textarea id="review-content" class="form-control" rows="5" required></textarea>
                                    </div>
                                </div>
                            </div>
                            
                            <input type="hidden" id="ticket-id" value="${ticketId}">
                            
                            <div id="review-error" class="alert alert-danger hidden mt-3"></div>
                            
                            <div class="text-right mt-3">
                                <button type="button" id="review-cancel-btn" class="btn btn-secondary">Annuler</button>
                                <button type="submit" class="btn btn-primary">Envoyer</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            // Ajouter les écouteurs d'événements
            this.addReviewForTicketFormEventListeners();
        } catch (error) {
            console.error('Erreur lors du chargement du ticket pour la critique:', error);
            alert(error instanceof Error ? error.message : 'Une erreur est survenue lors du chargement du ticket.');
            // Rediriger vers le flux en cas d'erreur
            document.dispatchEvent(new CustomEvent('navigation:feed'));
        }
    }
    
    /**
     * Ajoute les écouteurs d'événements pour le formulaire de critique
     */
    private addReviewFormEventListeners(): void {
        const form = document.getElementById('create-review-form') as HTMLFormElement;
        const cancelBtn = document.getElementById('review-cancel-btn');
        const imageUpload = document.getElementById('ticket-image-upload');
        const imageInput = document.getElementById('ticket-image-input') as HTMLInputElement;
        const imagePreview = document.getElementById('ticket-image-preview');
        const navLogout = document.getElementById('nav-logout');
        const navFeed = document.getElementById('nav-feed');
        const navPosts = document.getElementById('nav-posts');
        const navSubscriptions = document.getElementById('nav-subscriptions');
        
        // Gérer le téléchargement d'image
        imageUpload?.addEventListener('click', () => {
            imageInput?.click();
        });
        
        // Afficher l'aperçu de l'image
        imageInput?.addEventListener('change', (event) => {
            const target = event.target as HTMLInputElement;
            if (target.files && target.files[0] && imagePreview) {
                const file = target.files[0];
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    if (imagePreview) {
                        imagePreview.innerHTML = `<img src="${e.target?.result}" alt="Aperçu" style="max-width: 100%; max-height: 200px;">`;
                        imagePreview.classList.remove('hidden');
                    }
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        // Gérer la soumission du formulaire
        form?.addEventListener('submit', async (event) => {
            event.preventDefault();
            await this.handleCreateReview();
        });
        
        // Gérer le bouton d'annulation
        cancelBtn?.addEventListener('click', () => {
            // Déclencher un événement pour revenir au flux
            document.dispatchEvent(new CustomEvent('navigation:feed'));
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
        
        navSubscriptions?.addEventListener('click', (event) => {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent('navigation:subscriptions'));
        });
    }
    
    /**
     * Ajoute les écouteurs d'événements pour le formulaire de critique en réponse à un ticket
     */
    private addReviewForTicketFormEventListeners(): void {
        const form = document.getElementById('create-review-for-ticket-form') as HTMLFormElement;
        const cancelBtn = document.getElementById('review-cancel-btn');
        const navLogout = document.getElementById('nav-logout');
        const navFeed = document.getElementById('nav-feed');
        const navPosts = document.getElementById('nav-posts');
        const navSubscriptions = document.getElementById('nav-subscriptions');
        
        // Gérer la soumission du formulaire
        form?.addEventListener('submit', async (event) => {
            event.preventDefault();
            await this.handleCreateReviewForTicket();
        });
        
        // Gérer le bouton d'annulation
        cancelBtn?.addEventListener('click', () => {
            // Déclencher un événement pour revenir au flux
            document.dispatchEvent(new CustomEvent('navigation:feed'));
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
        
        navSubscriptions?.addEventListener('click', (event) => {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent('navigation:subscriptions'));
        });
    }
    
    /**
     * Gère la création d'une nouvelle critique (avec création de ticket)
     */
    private async handleCreateReview(): Promise<void> {
        const ticketTitleInput = document.getElementById('ticket-title') as HTMLInputElement;
        const ticketDescriptionInput = document.getElementById('ticket-description') as HTMLTextAreaElement;
        const imageInput = document.getElementById('ticket-image-input') as HTMLInputElement;
        const reviewHeadlineInput = document.getElementById('review-headline') as HTMLInputElement;
        const reviewContentInput = document.getElementById('review-content') as HTMLTextAreaElement;
        const ratingInputs = document.querySelectorAll('input[name="rating"]') as NodeListOf<HTMLInputElement>;
        const errorElement = document.getElementById('review-error');
        
        const ticketTitle = ticketTitleInput.value.trim();
        const ticketDescription = ticketDescriptionInput.value.trim();
        const reviewHeadline = reviewHeadlineInput.value.trim();
        const reviewContent = reviewContentInput.value.trim();
        const userId = AuthService.getUserId();
        
        // Récupérer la note sélectionnée
        let rating = 5; // Valeur par défaut
        for (const input of ratingInputs) {
            if (input.checked) {
                rating = parseInt(input.value, 10);
                break;
            }
        }
        
        // Vérifier que les champs requis sont remplis
        if (!ticketTitle || !reviewHeadline || !reviewContent || !userId) {
            if (errorElement) {
                errorElement.textContent = 'Veuillez remplir tous les champs requis.';
                errorElement.classList.remove('hidden');
            }
            return;
        }
        
        try {
            let imageBase64 = null;
            
            // Traiter l'image si elle existe
            if (imageInput.files && imageInput.files[0]) {
                imageBase64 = await ApiService.imageToBase64(imageInput.files[0]);
            }
            
            // Créer le ticket
            const newTicket: Omit<Ticket, 'id'> = {
                title: ticketTitle,
                description: ticketDescription,
                userId,
                image: imageBase64 || undefined,
                time_created: new Date().toISOString()
            };
            
            const ticket = await this.ticketModel.createTicket(newTicket);
            
            // Créer la critique
            const newReview: Omit<Review, 'id'> = {
                ticketId: ticket.id,
                userId,
                rating,
                headline: reviewHeadline,
                content: reviewContent,
                time_created: new Date().toISOString()
            };
            
            await this.reviewModel.createReview(newReview);
            
            // Rediriger vers le flux
            document.dispatchEvent(new CustomEvent('navigation:feed'));
            
            // Déclencher un événement pour informer les autres contrôleurs
            document.dispatchEvent(new CustomEvent('review:created'));
        } catch (error) {
            // Afficher l'erreur
            if (errorElement) {
                errorElement.textContent = error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de la critique.';
                errorElement.classList.remove('hidden');
            }
        }
    }
    
    /**
     * Gère la création d'une nouvelle critique en réponse à un ticket existant
     */
    private async handleCreateReviewForTicket(): Promise<void> {
        const ticketIdInput = document.getElementById('ticket-id') as HTMLInputElement;
        const reviewHeadlineInput = document.getElementById('review-headline') as HTMLInputElement;
        const reviewContentInput = document.getElementById('review-content') as HTMLTextAreaElement;
        const ratingInputs = document.querySelectorAll('input[name="rating"]') as NodeListOf<HTMLInputElement>;
        const errorElement = document.getElementById('review-error');
        
        const ticketId = parseInt(ticketIdInput.value, 10);
        const reviewHeadline = reviewHeadlineInput.value.trim();
        const reviewContent = reviewContentInput.value.trim();
        const userId = AuthService.getUserId();
        
        // Récupérer la note sélectionnée
        let rating = 5; // Valeur par défaut
        for (const input of ratingInputs) {
            if (input.checked) {
                rating = parseInt(input.value, 10);
                break;
            }
        }
        
        // Vérifier que les champs requis sont remplis
        if (!ticketId || !reviewHeadline || !reviewContent || !userId) {
            if (errorElement) {
                errorElement.textContent = 'Veuillez remplir tous les champs requis.';
                errorElement.classList.remove('hidden');
            }
            return;
        }
        
        try {
            // Vérifier si l'utilisateur a déjà posté une critique pour ce ticket
            const hasReviewed = await this.reviewModel.hasUserReviewedTicket(userId, ticketId);
            if (hasReviewed) {
                throw new Error('Vous avez déjà posté une critique pour ce ticket.');
            }
            
            // Créer la critique
            const newReview: Omit<Review, 'id'> = {
                ticketId,
                userId,
                rating,
                headline: reviewHeadline,
                content: reviewContent,
                time_created: new Date().toISOString()
            };
            
            await this.reviewModel.createReview(newReview);
            
            // Rediriger vers le flux
            document.dispatchEvent(new CustomEvent('navigation:feed'));
            
            // Déclencher un événement pour informer les autres contrôleurs
            document.dispatchEvent(new CustomEvent('review:created'));
        } catch (error) {
            // Afficher l'erreur
            if (errorElement) {
                errorElement.textContent = error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de la critique.';
                errorElement.classList.remove('hidden');
            }
        }
    }
    
    /**
     * Affiche le formulaire de modification d'une critique
     */
    public async showEditReviewForm(reviewId: number): Promise<void> {
        try {
            const review = await this.reviewModel.getReviewById(reviewId);
            const ticket = await this.ticketModel.getTicketById(review.ticketId);
            const userId = AuthService.getUserId();
            
            // Vérifier que l'utilisateur est le propriétaire de la critique
            if (review.userId !== userId) {
                throw new Error('Vous n\'êtes pas autorisé à modifier cette critique.');
            }
            
            const mainContainer = document.getElementById('main-container');
            if (!mainContainer) return;
            
            mainContainer.innerHTML = `
                <header>
                    <div class="container">
                        <div class="nav">
                            <div class="nav-logo">LITReview</div>
                            <ul class="nav-links">
                                <li><a href="#" id="nav-feed">Flux</a></li>
                                <li><a href="#" id="nav-posts">Posts</a></li>
                                <li><a href="#" id="nav-subscriptions">Abonnements</a></li>
                                <li><a href="#" id="nav-logout">Se déconnecter</a></li>
                            </ul>
                        </div>
                    </div>
                </header>
                
                <div class="container">
                    <h2>Modifier votre critique</h2>
                    
                    <div class="form-container">
                        <form id="edit-review-form">
                            <div class="card mb-4">
                                <div class="card-header">
                                    <h3>Vous êtes en train de poster en réponse à</h3>
                                </div>
                                <div class="card-body">
                                    <div class="ticket-card">
                                        <div class="ticket-header">
                                            <div>
                                                <p class="ticket-meta">${new Date(ticket.time_created).toLocaleString('fr-FR')}</p>
                                                <p><strong>${ticket.userId === userId ? 'Vous avez' : 'Un utilisateur a'} demandé une critique</strong></p>
                                            </div>
                                        </div>
                                        <h3>${ticket.title}</h3>
                                        <p>${ticket.description}</p>
                                        ${ticket.image ? `<img src="${ticket.image}" alt="${ticket.title}" class="ticket-image">` : ''}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="card">
                                <div class="card-header">
                                    <h3>Critique</h3>
                                </div>
                                <div class="card-body">
                                    <div class="form-group">
                                        <label for="review-headline" class="form-label">Titre</label>
                                        <input type="text" id="review-headline" class="form-control" value="${review.headline}" required>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label class="form-label">Note</label>
                                        <div class="rating-input">
                                            <div class="rating-option">
                                                <input type="radio" name="rating" id="rating-0" value="0" ${review.rating === 0 ? 'checked' : ''}>
                                                <label for="rating-0">0</label>
                                            </div>
                                            <div class="rating-option">
                                                <input type="radio" name="rating" id="rating-1" value="1" ${review.rating === 1 ? 'checked' : ''}>
                                                <label for="rating-1">1</label>
                                            </div>
                                            <div class="rating-option">
                                                <input type="radio" name="rating" id="rating-2" value="2" ${review.rating === 2 ? 'checked' : ''}>
                                                <label for="rating-2">2</label>
                                            </div>
                                            <div class="rating-option">
                                                <input type="radio" name="rating" id="rating-3" value="3" ${review.rating === 3 ? 'checked' : ''}>
                                                <label for="rating-3">3</label>
                                            </div>
                                            <div class="rating-option">
                                                <input type="radio" name="rating" id="rating-4" value="4" ${review.rating === 4 ? 'checked' : ''}>
                                                <label for="rating-4">4</label>
                                            </div>
                                            <div class="rating-option">
                                                <input type="radio" name="rating" id="rating-5" value="5" ${review.rating === 5 ? 'checked' : ''}>
                                                <label for="rating-5">5</label>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="review-content" class="form-label">Commentaire</label>
                                        <textarea id="review-content" class="form-control" rows="5" required>${review.content}</textarea>
                                    </div>
                                </div>
                            </div>
                            
                            <input type="hidden" id="review-id" value="${reviewId}">
                            
                            <div id="review-error" class="alert alert-danger hidden mt-3"></div>
                            
                            <div class="text-right mt-3">
                                <button type="button" id="review-cancel-btn" class="btn btn-secondary">Annuler</button>
                                <button type="submit" class="btn btn-primary">Envoyer</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            
            // Ajouter les écouteurs d'événements
            this.addEditReviewFormEventListeners();
        } catch (error) {
            console.error('Erreur lors du chargement de la critique à modifier:', error);
            alert(error instanceof Error ? error.message : 'Une erreur est survenue lors du chargement de la critique.');
            // Rediriger vers les posts en cas d'erreur
            document.dispatchEvent(new CustomEvent('navigation:posts'));
        }
    }
    
    /**
     * Ajoute les écouteurs d'événements pour le formulaire de modification de critique
     */
    private addEditReviewFormEventListeners(): void {
        const form = document.getElementById('edit-review-form') as HTMLFormElement;
        const cancelBtn = document.getElementById('review-cancel-btn');
        const navLogout = document.getElementById('nav-logout');
        const navFeed = document.getElementById('nav-feed');
        const navPosts = document.getElementById('nav-posts');
        const navSubscriptions = document.getElementById('nav-subscriptions');
        
        // Gérer la soumission du formulaire
        form?.addEventListener('submit', async (event) => {
            event.preventDefault();
            await this.handleUpdateReview();
        });
        
        // Gérer le bouton d'annulation
        cancelBtn?.addEventListener('click', () => {
            // Déclencher un événement pour revenir aux posts
            document.dispatchEvent(new CustomEvent('navigation:posts'));
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
        
        navSubscriptions?.addEventListener('click', (event) => {
            event.preventDefault();
            document.dispatchEvent(new CustomEvent('navigation:subscriptions'));
        });
    }
    
    /**
     * Gère la mise à jour d'une critique
     */
    private async handleUpdateReview(): Promise<void> {
        const reviewIdInput = document.getElementById('review-id') as HTMLInputElement;
        const reviewHeadlineInput = document.getElementById('review-headline') as HTMLInputElement;
        const reviewContentInput = document.getElementById('review-content') as HTMLTextAreaElement;
        const ratingInputs = document.querySelectorAll('input[name="rating"]') as NodeListOf<HTMLInputElement>;
        const errorElement = document.getElementById('review-error');
        
        const reviewId = parseInt(reviewIdInput.value, 10);
        const reviewHeadline = reviewHeadlineInput.value.trim();
        const reviewContent = reviewContentInput.value.trim();
        
        // Récupérer la note sélectionnée
        let rating = 5; // Valeur par défaut
        for (const input of ratingInputs) {
            if (input.checked) {
                rating = parseInt(input.value, 10);
                break;
            }
        }
        
        // Vérifier que les champs requis sont remplis
        if (!reviewId || !reviewHeadline || !reviewContent) {
            if (errorElement) {
                errorElement.textContent = 'Veuillez remplir tous les champs requis.';
                errorElement.classList.remove('hidden');
            }
            return;
        }
        
        try {
            // Mettre à jour la critique
            const updatedReview: Partial<Review> = {
                headline: reviewHeadline,
                content: reviewContent,
                rating
            };
            
            await this.reviewModel.updateReview(reviewId, updatedReview);
            
            // Rediriger vers les posts
            document.dispatchEvent(new CustomEvent('navigation:posts'));
            
            // Déclencher un événement pour informer les autres contrôleurs
            document.dispatchEvent(new CustomEvent('review:updated'));
        } catch (error) {
            // Afficher l'erreur
            if (errorElement) {
                errorElement.textContent = error instanceof Error ? error.message : 'Une erreur est survenue lors de la mise à jour de la critique.';
                errorElement.classList.remove('hidden');
            }
        }
    }
    
    /**
     * Supprime une critique
     */
    public async deleteReview(reviewId: number): Promise<void> {
        try {
            const review = await this.reviewModel.getReviewById(reviewId);
            const userId = AuthService.getUserId();
            
            // Vérifier que l'utilisateur est le propriétaire de la critique
            if (review.userId !== userId) {
                throw new Error('Vous n\'êtes pas autorisé à supprimer cette critique.');
            }
            
            // Confirmer la suppression
            if (confirm('Êtes-vous sûr de vouloir supprimer cette critique ?')) {
                await this.reviewModel.deleteReview(reviewId);
                
                // Déclencher un événement pour informer les autres contrôleurs
                document.dispatchEvent(new CustomEvent('review:deleted'));
                
                // Rafraîchir la vue des posts
                document.dispatchEvent(new CustomEvent('navigation:posts'));
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de la critique:', error);
            alert(error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression de la critique.');
        }
    }
}
