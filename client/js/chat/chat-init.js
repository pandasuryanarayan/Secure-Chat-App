// ============================================
// CHAT APPLICATION INITIALIZATION
// ============================================

import CONFIG from './config.js';
import AppState from './state-manager.js';
import socketManager from './socket-manager.js';
import UIController from './ui-controller.js';
import EncryptionHandler from './encryption-handler.js';
import ContactHandler from './contact-handler.js';
import MessageHandler from './message-handler.js';
import ImageHandler from './image-handler.js';
import StatusHandler from './status-handler.js';
import NotificationHandler from './notification-handler.js';
import EventListeners from './event-listeners.js';
import ApiHandler from './api-handler.js';

class ChatApp {
    constructor() {
        this.initialized = false;
    }
    
    async init() {
        if (this.initialized) {
            console.warn('App already initialized');
            return;
        }
        
        console.log('Initializing Chat Application...');
        
        try {
            // 1. Check authentication (client-side check)
            this.checkAuthClient();
            
            // 2. ✅ NEW: Verify token with server
            const isValid = await this.verifyTokenWithServer();
            if (!isValid) {
                console.error('Token verification failed');
                this.handleInvalidToken();
                return;
            }
            
            // 3. Initialize Socket.IO
            socketManager.initialize();
            
            // 4. Initialize encryption
            await EncryptionHandler.initialize();
            
            // 5. Setup socket listeners
            this.setupSocketListeners();
            
            // 6. Setup DOM event listeners
            EventListeners.setup();
            
            // 7. Initialize UI
            UIController.initUserDisplay();
            UIController.updateContactsEmptyState();
            
            // 8. Request notification permission
            await NotificationHandler.requestPermission();
            
            this.initialized = true;
            console.log('Chat Application initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Chat Application:', error);
            
            if (error.message === 'Not authenticated') {
                return; // Already redirecting
            }
            
            alert('Failed to initialize chat application. Please refresh the page.');
        }
    }
    
    /**
     * Check authentication (client-side only)
     */
    checkAuthClient() {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');
        
        if (!token || !userId || !username) {
            console.warn('User not authenticated (no credentials), redirecting to login');
            window.location.href = './login.html';
            throw new Error('Not authenticated');
        }
    }
    
    /**
     * ✅ NEW: Verify token with server
     */
    async verifyTokenWithServer() {
        try {
            console.log('Verifying token with server...');
            
            const isValid = await ApiHandler.verifyToken();
            
            if (!isValid) {
                console.error('Token is invalid or blacklisted');
                return false;
            }
            
            console.log('✅ Token verified successfully');
            return true;
            
        } catch (error) {
            console.error('Token verification error:', error);
            return false;
        }
    }
    
    /**
     * ✅ NEW: Handle invalid/blacklisted token
     */
    handleInvalidToken() {
        NotificationHandler.showToast('Session expired. Please login again.', 'error');
        
        // Clear invalid credentials
        localStorage.clear();
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = './login.html';
        }, 2000);
    }
    
    /**
     * Setup all socket listeners
     */
    setupSocketListeners() {
        EncryptionHandler.setupSocketListeners();
        ContactHandler.setupSocketListeners();
        MessageHandler.setupSocketListeners();
        ImageHandler.setupSocketListeners();
        StatusHandler.setupSocketListeners();
    }
    
    /**
     * Cleanup on page unload
     */
    cleanup() {
        console.log('Cleaning up Chat Application...');
        socketManager.disconnect();
        AppState.reset();
    }
}

// Create and export app instance
const chatApp = new ChatApp();

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        chatApp.init();
    });
} else {
    chatApp.init();
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    chatApp.cleanup();
});

// Export for debugging
window.ChatApp = chatApp;
window.AppState = AppState;
window.CONFIG = CONFIG;

export default chatApp;