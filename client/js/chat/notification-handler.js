// ============================================
// NOTIFICATION HANDLER
// ============================================

import CONFIG from './config.js';
import DOMManager from './dom-manager.js';

const NotificationHandler = {
    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Use global showToast if available (from app-init.js)
        if (window.showToast) {
            window.showToast(message, type);
            return;
        }
        
        // Fallback
        const toast = DOMManager.get('toastNotification');
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = 'sc-toast sc-toast--visible';
        
        if (type === 'error') {
            toast.classList.add('sc-toast--error');
        } else if (type === 'success') {
            toast.classList.add('sc-toast--success');
        }
        
        setTimeout(() => {
            toast.classList.remove('sc-toast--visible');
        }, CONFIG.TOAST.DURATION);
    },
    
    /**
     * Show browser notification
     */
    showBrowserNotification(title, message, icon = './notification.png') {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body: message,
                icon: icon
            });
        }
    },
    
    /**
     * Request notification permission
     */
    async requestPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            try {
                const permission = await Notification.requestPermission();
                return permission === 'granted';
            } catch (error) {
                console.error('Error requesting notification permission:', error);
                return false;
            }
        }
        return Notification.permission === 'granted';
    },
    
    /**
     * Check if notifications are supported
     */
    isSupported() {
        return 'Notification' in window;
    },
    
    /**
     * Get current permission status
     */
    getPermission() {
        return Notification.permission;
    }
};

export default NotificationHandler;