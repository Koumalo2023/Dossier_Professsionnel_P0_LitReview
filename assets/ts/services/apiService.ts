/**
 * Service API pour gérer les requêtes HTTP
 */
export class ApiService {
    private static readonly BASE_URL = 'http://localhost:3000';
    
    /**
     * Effectue une requête GET
     */
    static async get<T>(endpoint: string): Promise<T> {
        try {
            const response = await fetch(`${this.BASE_URL}/${endpoint}`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Erreur lors de la requête GET vers ${endpoint}:`, error);
            throw error;
        }
    }
    
    /**
     * Effectue une requête POST
     */
    static async post<T>(endpoint: string, data: any): Promise<T> {
        try {
            const response = await fetch(`${this.BASE_URL}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Erreur lors de la requête POST vers ${endpoint}:`, error);
            throw error;
        }
    }
    
    /**
     * Effectue une requête PATCH
     */
    static async patch<T>(endpoint: string, data: any): Promise<T> {
        try {
            const response = await fetch(`${this.BASE_URL}/${endpoint}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`Erreur lors de la requête PATCH vers ${endpoint}:`, error);
            throw error;
        }
    }
    
    /**
     * Effectue une requête DELETE
     */
    static async delete(endpoint: string): Promise<void> {
        try {
            const response = await fetch(`${this.BASE_URL}/${endpoint}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
        } catch (error) {
            console.error(`Erreur lors de la requête DELETE vers ${endpoint}:`, error);
            throw error;
        }
    }
    
    /**
     * Convertit une image en base64 pour le stockage
     */
    static async imageToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }
}
