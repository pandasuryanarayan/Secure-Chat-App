// ============================================
// STATUS HANDLER
// ============================================

import AppState from './state-manager.js';
import UIController from './ui-controller.js';
import ContactHandler from './contact-handler.js';
import EncryptionHandler from './encryption-handler.js';
import NotificationHandler from './notification-handler.js';
import socketManager from './socket-manager.js';

const StatusHandler = {
    /**
     * Handle user coming online
     */
    async handleUserOnline(data) {
        const { userId, username } = data;
        
        console.log(`User ${username} (${userId}) came online`);
        
        // Add to online users
        AppState.setUserOnline(userId);
        
        // Reset key exchange status - needs to be re-established
        AppState.setKeyExchangeStatus(userId, false);
        
        if (AppState.hasContact(userId)) {
            const user = AppState.getContact(userId);
            user.isOnline = true;
            
            // Update contact display
            ContactHandler.displayContact(user);
            
            // Show notification
            NotificationHandler.showToast(`${username} is online`, 'info');
            
            const currentUser = AppState.getCurrentChatUser();
            
            // If this is the current chat user, update UI but keep disabled
            if (currentUser === userId) {
                UIController.updateChatPartnerStatus(
                    username,
                    'Securing connection...',
                    false
                );
                
                // Disable controls while securing connection
                UIController.updateMessageControls();
            }
            
            // Re-initiate key exchange with the user who came online
            console.log(`Initiating key exchange with ${username}`);
            await EncryptionHandler.initiateKeyExchange(userId);
        }
    },
    
    /**
     * Handle user going offline
     */
    handleUserOffline(data) {
        const { userId } = data;
        
        console.log(`User ${userId} went offline`);
        
        // Remove from online users
        AppState.setUserOffline(userId);
        
        // Clear key exchange status
        AppState.setKeyExchangeStatus(userId, false);
        
        if (AppState.hasContact(userId)) {
            const user = AppState.getContact(userId);
            user.isOnline = false;
            ContactHandler.displayContact(user);
            
            const currentUser = AppState.getCurrentChatUser();
            
            if (currentUser === userId) {
                UIController.updateChatPartnerStatus(
                    user.username,
                    'Offline',
                    false
                );
                UIController.updateMessageControls();
            }
        }
    },
    
    /**
     * Setup socket listeners
     */
    setupSocketListeners() {
        socketManager.on('user-online', async (data) => {
            await this.handleUserOnline(data);
        });
        
        socketManager.on('user-offline', (data) => {
            this.handleUserOffline(data);
        });
    }
};

export default StatusHandler;