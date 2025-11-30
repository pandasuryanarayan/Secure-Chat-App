// ============================================
// ENCRYPTION HANDLER
// ============================================

import AppState from './state-manager.js';
import socketManager from './socket-manager.js';
import UIController from './ui-controller.js';

const EncryptionHandler = {
    /**
     * Initialize encryption
     */
    async initialize() {
        try {
            await AppState.encryption.generateKeyPair();
            console.log('Encryption initialized');
        } catch (error) {
            console.error('Error initializing encryption:', error);
            throw error;
        }
    },
    
    /**
     * Initiate key exchange with a user
     */
    async initiateKeyExchange(targetUserId) {
        console.log(`Starting key exchange with user ${targetUserId}`);
        
        try {
            // Mark as in progress
            AppState.setKeyExchangeStatus(targetUserId, false);
            
            const publicKey = await AppState.encryption.exportPublicKey();
            const aesKey = await AppState.encryption.generateAESKey();
            
            socketManager.emit('key-exchange', {
                targetUserId,
                publicKey,
                type: 'public-key'
            });
            
            AppState.encryption.tempAESKey = aesKey;
            
            console.log(`Key exchange initiated with user ${targetUserId}`);
        } catch (error) {
            console.error('Error initiating key exchange:', error);
            AppState.setKeyExchangeStatus(targetUserId, false);
        }
    },
    
    /**
     * Handle incoming public key
     */
    async handlePublicKey(data) {
        console.log(`Received public key from user ${data.fromUserId}`);
        
        try {
            const publicKey = await AppState.encryption.importPublicKey(data.publicKey);
            const aesKey = await AppState.encryption.generateAESKey();
            AppState.encryption.setSharedSecret(data.fromUserId, aesKey);
            
            const encryptedAESKey = await AppState.encryption.encryptAESKey(aesKey, publicKey);
            
            socketManager.emit('key-exchange', {
                targetUserId: data.fromUserId,
                publicKey: encryptedAESKey,
                type: 'aes-key'
            });
            
            console.log(`Sent AES key to user ${data.fromUserId}`);
            
            // Mark key exchange as complete
            AppState.setKeyExchangeStatus(data.fromUserId, true);
            
            // Notify completion
            socketManager.emit('key-exchange', {
                targetUserId: data.fromUserId,
                type: 'exchange-complete'
            });
            
            console.log(`Key exchange completed with user ${data.fromUserId}`);
            
            // Update UI
            this.updateUIAfterKeyExchange(data.fromUserId);
            
        } catch (error) {
            console.error('Error handling public key:', error);
            AppState.setKeyExchangeStatus(data.fromUserId, false);
        }
    },
    
    /**
     * Handle incoming AES key
     */
    async handleAESKey(data) {
        console.log(`Received AES key from user ${data.fromUserId}`);
        
        try {
            const aesKey = await AppState.encryption.decryptAESKey(data.publicKey);
            AppState.encryption.setSharedSecret(data.fromUserId, aesKey);
            
            console.log(`AES key set for user ${data.fromUserId}`);
            
            // Mark key exchange as complete
            AppState.setKeyExchangeStatus(data.fromUserId, true);
            
            console.log(`Key exchange completed with user ${data.fromUserId}`);
            
            // Update UI
            this.updateUIAfterKeyExchange(data.fromUserId);
            
        } catch (error) {
            console.error('Error handling AES key:', error);
            AppState.setKeyExchangeStatus(data.fromUserId, false);
        }
    },
    
    /**
     * Handle exchange complete confirmation
     */
    handleExchangeComplete(data) {
        console.log(`Key exchange completion confirmed by user ${data.fromUserId}`);
        
        // Ensure it's marked as complete
        AppState.setKeyExchangeStatus(data.fromUserId, true);
        
        // Update UI
        this.updateUIAfterKeyExchange(data.fromUserId);
    },
    
    /**
     * Update UI after key exchange
     */
    updateUIAfterKeyExchange(userId) {
        const currentUser = AppState.getCurrentChatUser();
        
        if (currentUser === userId) {
            const user = AppState.getContact(userId);
            const isOnline = AppState.isUserOnline(userId);
            
            if (isOnline) {
                UIController.updateChatPartnerStatus(
                    user?.username || 'User',
                    'Online',
                    true
                );
            }
            
            UIController.updateMessageControls();
        }
        
        // Update contact display (imported from contact-handler)
        const user = AppState.getContact(userId);
        if (user && window.ContactHandler) {
            window.ContactHandler.displayContact(user);
        }
    },
    
    /**
     * Setup key exchange socket listeners
     */
    setupSocketListeners() {
        socketManager.on('key-exchange', async (data) => {
            try {
                if (data.type === 'public-key') {
                    await this.handlePublicKey(data);
                } else if (data.type === 'aes-key') {
                    await this.handleAESKey(data);
                } else if (data.type === 'exchange-complete') {
                    this.handleExchangeComplete(data);
                }
            } catch (error) {
                console.error('Error in key exchange:', error);
                AppState.setKeyExchangeStatus(data.fromUserId, false);
                
                const currentUser = AppState.getCurrentChatUser();
                if (currentUser === data.fromUserId) {
                    UIController.updateMessageControls();
                }
            }
        });
    }
};

export default EncryptionHandler;