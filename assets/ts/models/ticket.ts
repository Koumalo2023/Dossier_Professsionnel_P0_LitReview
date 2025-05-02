/**
 * Modèle de données pour les tickets
 */
export interface Ticket {
    id: number;
    title: string;
    userId: number;
    description: string;
    image?: string; // Optionnel car tous les tickets n'ont pas forcément d'image
    time_created: string;
}

/**
 * Classe pour gérer les opérations liées aux tickets
 */
export class TicketModel {
    private apiUrl = 'http://localhost:3000/tickets';
    
    /**
     * Récupère tous les tickets
     */
    async getAllTickets(): Promise<Ticket[]> {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la récupération des tickets:', error);
            throw error;
        }
    }
    
    /**
     * Récupère un ticket par son ID
     */
    async getTicketById(id: number): Promise<Ticket> {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Erreur lors de la récupération du ticket ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Récupère tous les tickets d'un utilisateur
     */
    async getTicketsByUserId(userId: number): Promise<Ticket[]> {
        try {
            const response = await fetch(`${this.apiUrl}?userId=${userId}`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Erreur lors de la récupération des tickets de l'utilisateur ${userId}:`, error);
            throw error;
        }
    }
    
    /**
     * Crée un nouveau ticket
     */
    async createTicket(ticket: Omit<Ticket, 'id'>): Promise<Ticket> {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ticket)
            });
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la création du ticket:', error);
            throw error;
        }
    }
    
    /**
     * Met à jour un ticket existant
     */
    async updateTicket(id: number, ticketData: Partial<Ticket>): Promise<Ticket> {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(ticketData)
            });
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du ticket ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Supprime un ticket
     */
    async deleteTicket(id: number): Promise<void> {
        try {
            const response = await fetch(`${this.apiUrl}/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
        } catch (error) {
            console.error(`Erreur lors de la suppression du ticket ${id}:`, error);
            throw error;
        }
    }
    
    /**
     * Récupère les tickets triés par date (du plus récent au plus ancien)
     */
    async getTicketsSortedByDate(): Promise<Ticket[]> {
        try {
            const tickets = await this.getAllTickets();
            return tickets.sort((a, b) => 
                new Date(b.time_created).getTime() - new Date(a.time_created).getTime()
            );
        } catch (error) {
            console.error('Erreur lors du tri des tickets par date:', error);
            throw error;
        }
    }
    
    /**
     * Récupère les tickets d'un utilisateur et des utilisateurs qu'il suit
     */
    async getTicketsForFeed(userId: number, followedUserIds: number[]): Promise<Ticket[]> {
        try {
            // Récupérer tous les tickets
            const allTickets = await this.getAllTickets();
            
            // Filtrer les tickets pour n'inclure que ceux de l'utilisateur et des utilisateurs suivis
            const relevantTickets = allTickets.filter(ticket => 
                ticket.userId === userId || followedUserIds.includes(ticket.userId)
            );
            
            // Trier par date (du plus récent au plus ancien)
            return relevantTickets.sort((a, b) => 
                new Date(b.time_created).getTime() - new Date(a.time_created).getTime()
            );
        } catch (error) {
            console.error(`Erreur lors de la récupération des tickets pour le flux de l'utilisateur ${userId}:`, error);
            throw error;
        }
    }
}
