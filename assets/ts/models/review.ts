/**
 * Modèle de données pour les critiques
 */
export interface Review {
    id: number;
    ticketId: number;
    userId: number;
    rating: number; // Note de 0 à 5
    headline: string; // Titre de la critique
    content: string; // Contenu de la critique
    time_created: string;
}

/**
 * Classe pour gérer les opérations liées aux critiques
 */
export class ReviewModel {
    private apiUrl = 'http://localhost:3000/reviews';
    
    /**
     * Récupère toutes les critiques
     */
    async getAllReviews(): Promise<Review[]> {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération des critiques:', error);
            throw error;
        }
    }
    
    /**
     * Récupère une critique par son ID
     */
    async getReviewById(id: number): Promise<Review> {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Erreur lors de la récupération de la critique ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Récupère toutes les critiques d'un utilisateur
     */
    async getReviewsByUserId(userId: number): Promise<Review[]> {
        try {
            const response = await fetch(`${this.apiUrl}?userId=${userId}`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Erreur lors de la récupération des critiques de l'utilisateur ${userId}:`, error);
            throw error;
        }
    }
    
    /**
     * Récupère toutes les critiques pour un ticket spécifique
     */
    async getReviewsByTicketId(ticketId: number): Promise<Review[]> {
        try {
            const response = await fetch(`${this.apiUrl}?ticketId=${ticketId}`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Erreur lors de la récupération des critiques pour le ticket ${ticketId}:`, error);
            throw error;
        }
    }
    
    /**
     * Vérifie si un utilisateur a déjà posté une critique pour un ticket
     */
    async hasUserReviewedTicket(userId: number, ticketId: number): Promise<boolean> {
        try {
            const response = await fetch(`${this.apiUrl}?userId=${userId}&ticketId=${ticketId}`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            const reviews = await response.json();
            return reviews.length > 0;
        } catch (error) {
            console.error(`Erreur lors de la vérification des critiques de l'utilisateur ${userId} pour le ticket ${ticketId}:`, error);
            throw error;
        }
    }
    
    /**
     * Crée une nouvelle critique
     */
    async createReview(review: Omit<Review, 'id'>): Promise<Review> {
        try {
            // Vérifier si l'utilisateur a déjà posté une critique pour ce ticket
            const hasReviewed = await this.hasUserReviewedTicket(review.userId, review.ticketId);
            if (hasReviewed) {
                throw new Error('Vous avez déjà posté une critique pour ce ticket.');
            }
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(review)
            });
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la création de la critique:', error);
            throw error;
        }
    }
    
    /**
     * Met à jour une critique existante
     */
    async updateReview(id: number, reviewData: Partial<Review>): Promise<Review> {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(reviewData)
            });
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de la critique ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Supprime une critique
     */
    async deleteReview(id: number): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
        } catch (error) {
            console.error(`Erreur lors de la suppression de la critique ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Récupère les critiques triées par date (du plus récent au plus ancien)
     */
    async getReviewsSortedByDate(): Promise<Review[]> {
        try {
            const reviews = await this.getAllReviews();
            return reviews.sort((a, b) => 
                new Date(b.time_created).getTime() - new Date(a.time_created).getTime()
            );
        } catch (error) {
            console.error('Erreur lors du tri des critiques par date:', error);
            throw error;
        }
    }
    
    /**
     * Récupère les critiques d'un utilisateur et des utilisateurs qu'il suit
     */
    async getReviewsForFeed(userId: number, followedUserIds: number[]): Promise<Review[]> {
        try {
            // Récupérer toutes les critiques
            const allReviews = await this.getAllReviews();
            
            // Filtrer les critiques pour n'inclure que celles de l'utilisateur et des utilisateurs suivis
            const relevantReviews = allReviews.filter(review => 
                review.userId === userId || followedUserIds.includes(review.userId)
            );
            
            // Trier par date (du plus récent au plus ancien)
            return relevantReviews.sort((a, b) => 
                new Date(b.time_created).getTime() - new Date(a.time_created).getTime()
            );
        } catch (error) {
            console.error(`Erreur lors de la récupération des critiques pour le flux de l'utilisateur ${userId}:`, error);
            throw error;
        }
    }
}
