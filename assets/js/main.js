/**
 * Point d'entrée principal de l'application LITReview
 */
import { AuthController } from './controllers/authController.js';
import { TicketController } from './controllers/ticketController.js';
import { ReviewController } from './controllers/reviewController.js';
import { SubscriptionController } from './controllers/subscriptionController.js';
import { FeedController } from './controllers/feedController.js';
// Initialiser les contrôleurs
document.addEventListener('DOMContentLoaded', () => {
    // Créer les instances des contrôleurs
    const authController = new AuthController();
    const ticketController = new TicketController();
    const reviewController = new ReviewController();
    const subscriptionController = new SubscriptionController();
    const feedController = new FeedController();
    // Écouter les événements spécifiques
    document.addEventListener('ticket:create', () => {
        ticketController.showCreateTicketForm();
    });
    document.addEventListener('ticket:edit', (event) => {
        const customEvent = event;
        ticketController.showEditTicketForm(customEvent.detail.ticketId);
    });
    document.addEventListener('ticket:delete', (event) => {
        const customEvent = event;
        ticketController.deleteTicket(customEvent.detail.ticketId);
    });
    document.addEventListener('review:create', () => {
        reviewController.showCreateReviewForm();
    });
    document.addEventListener('review:create-for-ticket', (event) => {
        const customEvent = event;
        reviewController.showCreateReviewForTicketForm(customEvent.detail.ticketId);
    });
    document.addEventListener('review:edit', (event) => {
        const customEvent = event;
        reviewController.showEditReviewForm(customEvent.detail.reviewId);
    });
    document.addEventListener('review:delete', (event) => {
        const customEvent = event;
        reviewController.deleteReview(customEvent.detail.reviewId);
    });
});
//# sourceMappingURL=main.js.map