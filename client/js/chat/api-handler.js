// ============================================
// API HANDLER - Centralized API calls
// ============================================

import CONFIG from './config.js';
import NotificationHandler from './notification-handler.js';

const ApiHandler = {
    /**
     * Make authenticated API call
     */
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');
        
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '',
                ...options.headers
            }
        };
        
        try {
            const response = await fetch(`${CONFIG.API_URL}${endpoint}`, config);
            
            // Handle token revocation/expiration
            if (response.status === 401) {
                const data = await response.json().catch(() => ({}));
                
                if (data.code === 'TOKEN_REVOKED' || 
                    data.code === 'TOKEN_EXPIRED' || 
                    data.code === 'TOKEN_INVALID') {
                    
                    NotificationHandler.showToast(
                        data.message || 'Session expired. Please login again.', 
                        'error'
                    );
                    
                    // Clear local storage
                    localStorage.clear();
                    
                    // Disconnect socket if available
                    if (window.socketManager) {
                        window.socketManager.disconnect();
                    }
                    
                    // Redirect to login after delay
                    setTimeout(() => {
                        window.location.href = './login.html';
                    }, 2000);
                    
                    throw new Error('SESSION_EXPIRED');
                }
            }
            
            return response;
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    },
    
    /**
     * GET request
     */
    async get(endpoint) {
        return this.request(endpoint, {
            method: 'GET'
        });
    },
    
    /**
     * POST request
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    /**
     * PUT request
     */
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    },
    
    /**
     * Logout with token invalidation
     */
    async logout() {
        try {
            // Call logout endpoint to blacklist token
            await this.post('/logout');
            console.log('Token blacklisted successfully');
        } catch (error) {
            if (error.message !== 'SESSION_EXPIRED') {
                console.error('Logout error:', error);
            }
        } finally {
            // Always cleanup client-side
            this.cleanup();
        }
    },

    /**
     * Verify if current token is still valid
     */
    async verifyToken() {
        try {
            const response = await this.get('/verify-token');
            
            if (response.ok) {
                const data = await response.json();
                return data.valid === true;
            }
            
            return false;
        } catch (error) {
            console.error('Token verification failed:', error);
            return false;
        }
    },
    
    /**
     * Cleanup and redirect to login
     */
    cleanup() {
        // Clear local storage
        localStorage.clear();
        
        // Disconnect socket
        if (window.socketManager) {
            try {
                window.socketManager.disconnect();
            } catch (e) {
                console.error('Socket disconnect error:', e);
            }
        }
        
        // Redirect to login
        window.location.href = './login.html';
    }
};

export default ApiHandler;