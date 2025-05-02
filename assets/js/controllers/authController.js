/**
 * Contrôleur d'authentification pour gérer l'inscription et la connexion
 */
import { AuthService } from '../services/authService.js';
export class AuthController {
    constructor() {
        this.authContainer = document.getElementById('auth-container');
        this.mainContainer = document.getElementById('main-container');
        // Vérifier si l'utilisateur est déjà connecté
        this.checkAuthStatus();
    }
    /**
     * Vérifie si l'utilisateur est déjà connecté
     */
    checkAuthStatus() {
        if (AuthService.isAuthenticated()) {
            this.showMainContent();
        }
        else {
            this.showAuthForm();
        }
    }
    /**
     * Affiche le formulaire d'authentification
     */
    showAuthForm() {
        this.authContainer.classList.remove('hidden');
        this.mainContainer.classList.add('hidden');
        // Créer le contenu du formulaire d'authentification
        this.authContainer.innerHTML = `
            <div class="auth-container">
                <h1 class="text-center">LITReview</h1>
                
                <div class="auth-tabs">
                    <div class="auth-tab active" id="login-tab">Connectez-vous</div>
                    <div class="auth-tab" id="register-tab">Inscrivez-vous</div>
                </div>
                
                <div id="login-form" class="auth-form">
                    <div class="form-group">
                        <label for="login-username" class="form-label">Nom d'utilisateur</label>
                        <input type="text" id="login-username" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="login-password" class="form-label">Mot de passe</label>
                        <input type="password" id="login-password" class="form-control" required>
                    </div>
                    
                    <div id="login-error" class="alert alert-danger hidden"></div>
                    
                    <button id="login-button" class="btn btn-primary w-100">Se connecter</button>
                </div>
                
                <div id="register-form" class="auth-form hidden">
                    <div class="form-group">
                        <label for="register-username" class="form-label">Nom d'utilisateur</label>
                        <input type="text" id="register-username" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="register-password" class="form-label">Mot de passe</label>
                        <input type="password" id="register-password" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="register-confirm-password" class="form-label">Confirmer mot de passe</label>
                        <input type="password" id="register-confirm-password" class="form-control" required>
                    </div>
                    
                    <div id="register-error" class="alert alert-danger hidden"></div>
                    
                    <div class="d-flex justify-content-between">
                        <button id="register-back-button" class="btn btn-secondary">Retourner</button>
                        <button id="register-button" class="btn btn-primary">S'inscrire</button>
                    </div>
                </div>
            </div>
        `;
        // Ajouter les écouteurs d'événements
        this.addAuthEventListeners();
    }
    /**
     * Ajoute les écouteurs d'événements pour les formulaires d'authentification
     */
    addAuthEventListeners() {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const loginForm = document.getElementById('login-form');
        const registerForm = document.getElementById('register-form');
        const loginButton = document.getElementById('login-button');
        const registerButton = document.getElementById('register-button');
        const registerBackButton = document.getElementById('register-back-button');
        // Changer entre les onglets de connexion et d'inscription
        loginTab?.addEventListener('click', () => {
            loginTab.classList.add('active');
            registerTab?.classList.remove('active');
            loginForm?.classList.remove('hidden');
            registerForm?.classList.add('hidden');
        });
        registerTab?.addEventListener('click', () => {
            registerTab.classList.add('active');
            loginTab?.classList.remove('active');
            registerForm?.classList.remove('hidden');
            loginForm?.classList.add('hidden');
        });
        // Gérer le bouton de retour
        registerBackButton?.addEventListener('click', () => {
            loginTab?.click();
        });
        // Gérer la soumission du formulaire de connexion
        loginButton?.addEventListener('click', () => {
            this.handleLogin();
        });
        // Gérer la soumission du formulaire d'inscription
        registerButton?.addEventListener('click', () => {
            this.handleRegister();
        });
    }
    /**
     * Gère la soumission du formulaire de connexion
     */
    async handleLogin() {
        const usernameInput = document.getElementById('login-username');
        const passwordInput = document.getElementById('login-password');
        const errorElement = document.getElementById('login-error');
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        // Vérifier que les champs ne sont pas vides
        if (!username || !password) {
            if (errorElement) {
                errorElement.textContent = 'Veuillez remplir tous les champs.';
                errorElement.classList.remove('hidden');
            }
            return;
        }
        try {
            // Tenter de se connecter
            await AuthService.login(username, password);
            // Rediriger vers le contenu principal
            this.showMainContent();
            // Déclencher un événement pour informer les autres contrôleurs
            const authEvent = new CustomEvent('auth:login', {
                detail: { userId: AuthService.getUserId(), username: AuthService.getUsername() }
            });
            document.dispatchEvent(authEvent);
        }
        catch (error) {
            // Afficher l'erreur
            if (errorElement) {
                errorElement.textContent = error instanceof Error ? error.message : 'Une erreur est survenue lors de la connexion.';
                errorElement.classList.remove('hidden');
            }
        }
    }
    /**
     * Gère la soumission du formulaire d'inscription
     */
    async handleRegister() {
        const usernameInput = document.getElementById('register-username');
        const passwordInput = document.getElementById('register-password');
        const confirmPasswordInput = document.getElementById('register-confirm-password');
        const errorElement = document.getElementById('register-error');
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        // Vérifier que les champs ne sont pas vides
        if (!username || !password || !confirmPassword) {
            if (errorElement) {
                errorElement.textContent = 'Veuillez remplir tous les champs.';
                errorElement.classList.remove('hidden');
            }
            return;
        }
        // Vérifier que les mots de passe correspondent
        if (password !== confirmPassword) {
            if (errorElement) {
                errorElement.textContent = 'Les mots de passe ne correspondent pas.';
                errorElement.classList.remove('hidden');
            }
            return;
        }
        try {
            // Tenter de s'inscrire
            await AuthService.register(username, password);
            // Rediriger vers le contenu principal
            this.showMainContent();
            // Déclencher un événement pour informer les autres contrôleurs
            const authEvent = new CustomEvent('auth:register', {
                detail: { userId: AuthService.getUserId(), username: AuthService.getUsername() }
            });
            document.dispatchEvent(authEvent);
        }
        catch (error) {
            // Afficher l'erreur
            if (errorElement) {
                errorElement.textContent = error instanceof Error ? error.message : 'Une erreur est survenue lors de l\'inscription.';
                errorElement.classList.remove('hidden');
            }
        }
    }
    /**
     * Affiche le contenu principal de l'application
     */
    showMainContent() {
        this.authContainer.classList.add('hidden');
        this.mainContainer.classList.remove('hidden');
    }
    /**
     * Gère la déconnexion de l'utilisateur
     */
    handleLogout() {
        AuthService.logout();
        // Rediriger vers le formulaire d'authentification
        this.showAuthForm();
        // Déclencher un événement pour informer les autres contrôleurs
        const authEvent = new CustomEvent('auth:logout');
        document.dispatchEvent(authEvent);
    }
}
//# sourceMappingURL=authController.js.map