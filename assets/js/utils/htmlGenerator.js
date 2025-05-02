export class HtmlGenerator {
    /**
     * Génère le HTML pour les éléments du flux
     */
    static generateFeedItems(items, currentUserId) {
        let html = '';
        items.forEach(({ type, item, relatedItem, user }) => {
            if (type === 'ticket') {
                const ticket = item;
                html += '<div class="card mb-4">';
                html += '<div class="card-body">';
                html += '<div class="ticket-card">';
                html += '<div class="ticket-header">';
                html += '<div>';
                html += '<p class="ticket-meta">' + new Date(ticket.time_created).toLocaleString('fr-FR') + '</p>';
                html += '<p><strong>' + (user?.username || 'Utilisateur') + ' a demandé une critique</strong></p>';
                html += '</div>';
                html += '</div>';
                html += '<h3>' + ticket.title + '</h3>';
                html += '<p>' + ticket.description + '</p>';
                if (ticket.image) {
                    html += '<img src="' + ticket.image + '" alt="' + ticket.title + '" class="ticket-image">';
                }
                html += '<div class="text-right mt-3">';
                html += '<button class="btn btn-primary create-review-for-ticket-btn" data-ticket-id="' + ticket.id + '">Créer une critique</button>';
                html += '</div>';
                html += '</div>';
                html += '</div>';
                html += '</div>';
            }
            else {
                const review = item;
                const ticket = relatedItem;
                html += '<div class="card mb-4">';
                html += '<div class="card-body">';
                html += '<div class="review-card">';
                html += '<div class="review-header">';
                html += '<div>';
                html += '<p class="ticket-meta">' + new Date(review.time_created).toLocaleString('fr-FR') + '</p>';
                html += '<p><strong>' + (user?.username || 'Utilisateur') + ' a publié une critique</strong></p>';
                html += '</div>';
                html += '</div>';
                html += '<h3 class="review-title">' + review.headline + ' - ' + this.generateStars(review.rating) + '</h3>';
                html += '<p>' + review.content + '</p>';
                html += '<div class="card mt-3">';
                html += '<div class="card-body">';
                html += '<p><strong>Ticket - ' + (ticket.userId === currentUserId ? 'Vous' : (user?.username || 'Utilisateur')) + '</strong></p>';
                html += '<h4>' + ticket.title + '</h4>';
                if (ticket.image) {
                    html += '<img src="' + ticket.image + '" alt="' + ticket.title + '" class="ticket-image">';
                }
                html += '</div>';
                html += '</div>';
                html += '</div>';
                html += '</div>';
                html += '</div>';
            }
        });
        return html;
    }
    /**
     * Génère le HTML pour les posts de l'utilisateur
     */
    static generateUserPosts(tickets, reviews, ticketsForReviews) {
        let html = '';
        // Afficher les critiques
        reviews.forEach((review, index) => {
            const ticket = ticketsForReviews[index];
            html += '<div class="card mb-4">';
            html += '<div class="card-body">';
            html += '<div class="review-card">';
            html += '<div class="review-header">';
            html += '<div>';
            html += '<p class="ticket-meta">' + new Date(review.time_created).toLocaleString('fr-FR') + '</p>';
            html += '<p><strong>Vous avez publié une critique</strong></p>';
            html += '</div>';
            html += '</div>';
            html += '<h3 class="review-title">' + review.headline + ' - ' + this.generateStars(review.rating) + '</h3>';
            html += '<p>' + review.content + '</p>';
            html += '<div class="card mt-3">';
            html += '<div class="card-body">';
            html += '<p><strong>Ticket - ' + (ticket.userId === review.userId ? 'Vous' : 'Autre utilisateur') + '</strong></p>';
            html += '<h4>' + ticket.title + '</h4>';
            if (ticket.image) {
                html += '<img src="' + ticket.image + '" alt="' + ticket.title + '" class="ticket-image">';
            }
            html += '</div>';
            html += '</div>';
            html += '</div>';
            html += '</div>';
            html += '<div class="card-footer">';
            html += '<button class="btn btn-primary edit-review-btn" data-review-id="' + review.id + '">Modifier</button>';
            html += '<button class="btn btn-danger delete-review-btn" data-review-id="' + review.id + '">Supprimer</button>';
            html += '</div>';
            html += '</div>';
        });
        // Afficher les tickets
        tickets.forEach((ticket) => {
            html += '<div class="card mb-4">';
            html += '<div class="card-body">';
            html += '<div class="ticket-card">';
            html += '<div class="ticket-header">';
            html += '<div>';
            html += '<p class="ticket-meta">' + new Date(ticket.time_created).toLocaleString('fr-FR') + '</p>';
            html += '<p><strong>Vous avez publié un ticket</strong></p>';
            html += '</div>';
            html += '</div>';
            html += '<h3>' + ticket.title + '</h3>';
            html += '<p>' + ticket.description + '</p>';
            if (ticket.image) {
                html += '<img src="' + ticket.image + '" alt="' + ticket.title + '" class="ticket-image">';
            }
            html += '</div>';
            html += '</div>';
            html += '<div class="card-footer">';
            html += '<button class="btn btn-primary edit-ticket-btn" data-ticket-id="' + ticket.id + '">Modifier</button>';
            html += '<button class="btn btn-danger delete-ticket-btn" data-ticket-id="' + ticket.id + '">Supprimer</button>';
            html += '</div>';
            html += '</div>';
        });
        return html || '<p class="text-muted">Vous n\'avez pas encore créé de contenu.</p>';
    }
    /**
     * Génère le HTML pour les étoiles de notation
     */
    static generateStars(rating) {
        let stars = '';
        for (let i = 0; i < 5; i++) {
            stars += i < rating ? '★' : '☆';
        }
        return '<span class="stars">' + stars + '</span>';
    }
}
//# sourceMappingURL=htmlGenerator.js.map