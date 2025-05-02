/**
 * Contrôleur pour la gestion des tickets (création, modification, suppression)
 */
import { TicketModel } from '../models/ticket.js';
import { AuthService } from '../services/authService.js';
import { ApiService } from '../services/apiService.js';
export class TicketController {
    constructor() {
        this.ticketModel = new TicketModel();
        // Écouter les événements d'authentification
        document.addEventListener('auth:login', this.handleAuthEvent.bind(this));
        document.addEventListener('auth:register', this.handleAuthEvent.bind(this));
        document.addEventListener('auth:logout', this.handleLogout.bind(this));
    }
    /**
     * Gère les événements d'authentification
     */
    handleAuthEvent() {
        // Initialiser les fonctionnalités de ticket après connexion
        this.setupTicketEventListeners();
    }
    /**
     * Gère la déconnexion
     */
    handleLogout() {
        // Nettoyer les ressources si nécessaire
    }
    /**
     * Configure les écouteurs d'événements pour les fonctionnalités de ticket
     */
    setupTicketEventListeners() {
        // Écouteur pour le bouton de création de ticket
        const createTicketBtn = document.getElementById('create-ticket-btn');
        if (createTicketBtn) {
            createTicketBtn.addEventListener('click', this.showCreateTicketForm.bind(this));
        }
    }
    /**
     * Affiche le formulaire de création de ticket
     */
    showCreateTicketForm() {
        const mainContainer = document.getElementById('main-container');
        if (!mainContainer)
            return;
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
                <h2>Créer un ticket</h2>
                
                <div class="form-container">
                    <form id="create-ticket-form">
                        <div class="form-group">
                            <label for="ticket-title" class="form-label">Titre</label>
                            <input type="text" id="ticket-title" class="form-control" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="ticket-description" class="form-label">Description</label>
                            <textarea id="ticket-description" class="form-control" rows="5" required></textarea>
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
                        
                        <div id="ticket-error" class="alert alert-danger hidden"></div>
                        
                        <div class="text-right">
                            <button type="button" id="ticket-cancel-btn" class="btn btn-secondary">Annuler</button>
                            <button type="submit" class="btn btn-primary">Envoyer</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
        // Ajouter les écouteurs d'événements
        this.addTicketFormEventListeners();
    }
    /**
     * Ajoute les écouteurs d'événements pour le formulaire de ticket
     */
    addTicketFormEventListeners() {
        const form = document.getElementById('create-ticket-form');
        const cancelBtn = document.getElementById('ticket-cancel-btn');
        const imageUpload = document.getElementById('ticket-image-upload');
        const imageInput = document.getElementById('ticket-image-input');
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
            const target = event.target;
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
            await this.handleCreateTicket();
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
     * Gère la création d'un nouveau ticket
     */
    async handleCreateTicket() {
        const titleInput = document.getElementById('ticket-title');
        const descriptionInput = document.getElementById('ticket-description');
        const imageInput = document.getElementById('ticket-image-input');
        const errorElement = document.getElementById('ticket-error');
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const userId = AuthService.getUserId();
        // Vérifier que les champs requis sont remplis
        if (!title || !description || !userId) {
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
            const newTicket = {
                title,
                description,
                userId,
                image: imageBase64 || undefined,
                time_created: new Date().toISOString()
            };
            await this.ticketModel.createTicket(newTicket);
            // Rediriger vers le flux
            document.dispatchEvent(new CustomEvent('navigation:feed'));
            // Déclencher un événement pour informer les autres contrôleurs
            document.dispatchEvent(new CustomEvent('ticket:created'));
        }
        catch (error) {
            // Afficher l'erreur
            if (errorElement) {
                errorElement.textContent = error instanceof Error ? error.message : 'Une erreur est survenue lors de la création du ticket.';
                errorElement.classList.remove('hidden');
            }
        }
    }
    /**
     * Affiche le formulaire de modification d'un ticket
     */
    async showEditTicketForm(ticketId) {
        try {
            const ticket = await this.ticketModel.getTicketById(ticketId);
            const userId = AuthService.getUserId();
            // Vérifier que l'utilisateur est le propriétaire du ticket
            if (ticket.userId !== userId) {
                throw new Error('Vous n\'êtes pas autorisé à modifier ce ticket.');
            }
            const mainContainer = document.getElementById('main-container');
            if (!mainContainer)
                return;
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
                    <h2>Modifier votre ticket</h2>
                    
                    <div class="form-container">
                        <form id="edit-ticket-form">
                            <div class="form-group">
                                <label for="ticket-title" class="form-label">Titre</label>
                                <input type="text" id="ticket-title" class="form-control" value="${ticket.title}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="ticket-description" class="form-label">Description</label>
                                <textarea id="ticket-description" class="form-control" rows="5" required>${ticket.description}</textarea>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Image</label>
                                <div class="file-upload" id="ticket-image-upload">
                                    <div class="file-upload-icon">+</div>
                                    <div class="file-upload-text">Télécharger fichier</div>
                                </div>
                                <input type="file" id="ticket-image-input" accept="image/*" style="display: none;">
                                <div id="ticket-image-preview" class="mt-2 ${ticket.image ? '' : 'hidden'}">
                                    ${ticket.image ? `<img src="${ticket.image}" alt="Image actuelle" style="max-width: 100%; max-height: 200px;">` : ''}
                                </div>
                            </div>
                            
                            <div id="ticket-error" class="alert alert-danger hidden"></div>
                            
                            <div class="text-right">
                                <button type="button" id="ticket-cancel-btn" class="btn btn-secondary">Annuler</button>
                                <button type="submit" class="btn btn-primary">Envoyer</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;
            // Ajouter les écouteurs d'événements
            this.addEditTicketFormEventListeners(ticketId);
        }
        catch (error) {
            console.error('Erreur lors du chargement du ticket à modifier:', error);
            // Rediriger vers le flux en cas d'erreur
            document.dispatchEvent(new CustomEvent('navigation:feed'));
        }
    }
    /**
     * Ajoute les écouteurs d'événements pour le formulaire de modification de ticket
     */
    addEditTicketFormEventListeners(ticketId) {
        const form = document.getElementById('edit-ticket-form');
        const cancelBtn = document.getElementById('ticket-cancel-btn');
        const imageUpload = document.getElementById('ticket-image-upload');
        const imageInput = document.getElementById('ticket-image-input');
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
            const target = event.target;
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
            await this.handleUpdateTicket(ticketId);
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
     * Gère la mise à jour d'un ticket
     */
    async handleUpdateTicket(ticketId) {
        const titleInput = document.getElementById('ticket-title');
        const descriptionInput = document.getElementById('ticket-description');
        const imageInput = document.getElementById('ticket-image-input');
        const errorElement = document.getElementById('ticket-error');
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        // Vérifier que les champs requis sont remplis
        if (!title || !description) {
            if (errorElement) {
                errorElement.textContent = 'Veuillez remplir tous les champs requis.';
                errorElement.classList.remove('hidden');
            }
            return;
        }
        try {
            // Récupérer le ticket actuel
            const currentTicket = await this.ticketModel.getTicketById(ticketId);
            let imageBase64 = currentTicket.image;
            // Traiter l'image si elle a été modifiée
            if (imageInput.files && imageInput.files[0]) {
                imageBase64 = await ApiService.imageToBase64(imageInput.files[0]);
            }
            // Mettre à jour le ticket
            const updatedTicket = {
                title,
                description,
                image: imageBase64
            };
            await this.ticketModel.updateTicket(ticketId, updatedTicket);
            // Rediriger vers les posts
            document.dispatchEvent(new CustomEvent('navigation:posts'));
            // Déclencher un événement pour informer les autres contrôleurs
            document.dispatchEvent(new CustomEvent('ticket:updated'));
        }
        catch (error) {
            // Afficher l'erreur
            if (errorElement) {
                errorElement.textContent = error instanceof Error ? error.message : 'Une erreur est survenue lors de la mise à jour du ticket.';
                errorElement.classList.remove('hidden');
            }
        }
    }
    /**
     * Supprime un ticket
     */
    async deleteTicket(ticketId) {
        try {
            const ticket = await this.ticketModel.getTicketById(ticketId);
            const userId = AuthService.getUserId();
            // Vérifier que l'utilisateur est le propriétaire du ticket
            if (ticket.userId !== userId) {
                throw new Error('Vous n\'êtes pas autorisé à supprimer ce ticket.');
            }
            // Confirmer la suppression
            if (confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) {
                await this.ticketModel.deleteTicket(ticketId);
                // Déclencher un événement pour informer les autres contrôleurs
                document.dispatchEvent(new CustomEvent('ticket:deleted'));
                // Rafraîchir la vue des posts
                document.dispatchEvent(new CustomEvent('navigation:posts'));
            }
        }
        catch (error) {
            console.error('Erreur lors de la suppression du ticket:', error);
            alert(error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression du ticket.');
        }
    }
}
//# sourceMappingURL=ticketController.js.map