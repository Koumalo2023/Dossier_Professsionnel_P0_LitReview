/**
 * Service API pour gérer les requêtes HTTP
 */
export class ApiService {
    /**
     * Effectue une requête GET
     */
    static async get(endpoint) {
        try {
            const response = await fetch(`${this.BASE_URL}/${endpoint}`);
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            return await response.json();
        }
        catch (error) {
            console.error(`Erreur lors de la requête GET vers ${endpoint}:`, error);
            throw error;
        }
    }
    /**
     * Effectue une requête POST
     */
    static async post(endpoint, data) {
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
        }
        catch (error) {
            console.error(`Erreur lors de la requête POST vers ${endpoint}:`, error);
            throw error;
        }
    }
    /**
     * Effectue une requête PATCH
     */
    static async patch(endpoint, data) {
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
        }
        catch (error) {
            console.error(`Erreur lors de la requête PATCH vers ${endpoint}:`, error);
            throw error;
        }
    }
    /**
     * Effectue une requête DELETE
     */
    static async delete(endpoint) {
        try {
            const response = await fetch(`${this.BASE_URL}/${endpoint}`, {
                method: 'DELETE'
            });
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
        }
        catch (error) {
            console.error(`Erreur lors de la requête DELETE vers ${endpoint}:`, error);
            throw error;
        }
    }
    /**
     * Convertit une image en base64 pour le stockage
     */
    static async imageToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }
}
ApiService.BASE_URL = 'http://localhost:3000';
//# sourceMappingURL=apiService.js.map