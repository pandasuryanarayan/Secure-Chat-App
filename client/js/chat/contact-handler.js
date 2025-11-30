// ============================================
// CONTACT HANDLER
// ============================================

import CONFIG from './config.js';
import AppState from './state-manager.js';
import DOMManager from './dom-manager.js';
import UIController from './ui-controller.js';
import socketManager from './socket-manager.js';
import EncryptionHandler from './encryption-handler.js';
import NotificationHandler from './notification-handler.js';
import ApiHandler from './api-handler.js';

const ContactHandler = {
    /**
     * Search and add contact by ID
     */
    async addContact(searchId) {
        if (!searchId || searchId.length !== 6) {
            NotificationHandler.showToast('Please enter a valid 6-digit ID', 'error');
            return false;
        }

        if (searchId === localStorage.getItem('userId')) {
            NotificationHandler.showToast('You cannot add yourself as a contact', 'error');
            return false;
        }
        
        try {
            const response = await ApiHandler.get(`/user/${searchId}`);
            
            if (response.ok) {
                const user = await response.json();
                AppState.addContact(user.userId, user);

                if (user.isOnline) {
                    AppState.setUserOnline(user.userId);
                }

                UIController.updateContactsEmptyState();
                this.displayContact(user);

                // Notify the other user
                socketManager.emit('contact-added', {
                    targetUserId: user.userId,
                    addedBy: {
                        userId: localStorage.getItem('userId'),
                        username: localStorage.getItem('username')
                    }
                });

                // Initiate key exchange
                await EncryptionHandler.initiateKeyExchange(user.userId);
                
                NotificationHandler.showToast(`Connected with ${user.username}`, 'success');
                return true;
            } else {
                const error = await response.json();
                NotificationHandler.showToast(error.message || 'User not found', 'error');
                return false;
            }
        } catch (error) {
            if (error.message === 'SESSION_EXPIRED') return false;
            console.error('Error adding contact:', error);
            NotificationHandler.showToast('Error connecting to user', 'error');
            return false;
        }
    },
    
    /**
     * Handle when someone adds you as contact
     */
    async handleContactAdded(data) {
        const { addedBy } = data;
        
        if (!AppState.hasContact(addedBy.userId)) {
            try {
                const response = await ApiHandler.get(`/user/${addedBy.userId}`);
                
                if (response.ok) {
                    const user = await response.json();
                    AppState.addContact(user.userId, user);
                    AppState.setUserOnline(user.userId);
                    UIController.updateContactsEmptyState();
                    this.displayContact(user);
                    NotificationHandler.showBrowserNotification(
                        user.username,
                        `${user.username} added you as a contact`
                    );
                    
                    // Initiate key exchange
                    await EncryptionHandler.initiateKeyExchange(user.userId);
                }
            } catch (error) {
                if (error.message !== 'SESSION_EXPIRED') {
                    console.error('Error fetching contact:', error);
                }
            }
        }
    },
    
    /**
     * Display contact in sidebar
     */
    displayContact(user) {
        const contactsList = DOMManager.get('contactsList');
        if (!contactsList) return;
        
        const emptyState = contactsList.querySelector('.sc-contacts__empty');
        if (emptyState) {
            emptyState.remove();
        }
        
        let contactDiv = DOMManager.getById(`contact-${user.userId}`);
        
        if (!contactDiv) {
            contactDiv = document.createElement('div');
            contactDiv.className = 'sc-contact';
            contactDiv.id = `contact-${user.userId}`;
            contactsList.appendChild(contactDiv);
        }

        const isOnline = AppState.isUserOnline(user.userId);
        
        contactDiv.innerHTML = `
            <div class="sc-contact__avatar">
                <svg class="sc-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <span class="sc-contact__status-dot ${isOnline ? 'sc-contact__status-dot--online' : 'sc-contact__status-dot--offline'}"></span>
            </div>
            <div class="sc-contact__info">
                <div class="sc-contact__name">${user.username}</div>
                <div class="sc-contact__preview">ID: ${user.userId}</div>
            </div>
        `;

        contactDiv.onclick = () => this.selectContact(user);
    },
    
    /**
     * Select contact for chat
     */
    selectContact(user) {
        AppState.setCurrentChatUser(user.userId);
        
        // Update active state
        DOMManager.querySelectorAll('.sc-contact').forEach(item => {
            item.classList.remove('sc-contact--active');
        });
        
        const contactElement = DOMManager.getById(`contact-${user.userId}`);
        if (contactElement) {
            contactElement.classList.add('sc-contact--active');
            contactElement.classList.remove('sc-contact--unread');
        }

        const isOnline = AppState.isUserOnline(user.userId);
        const keyExchangeComplete = AppState.getKeyExchangeStatus(user.userId);
        
        // Update chat header
        let status;
        let isOnlineStatus;
        
        if (!isOnline) {
            status = 'Offline';
            isOnlineStatus = false;
        } else if (!keyExchangeComplete) {
            status = 'Securing connection...';
            isOnlineStatus = false;
        } else {
            status = 'Online';
            isOnlineStatus = true;
        }
        
        UIController.updateChatPartnerStatus(user.username, status, isOnlineStatus);
        UIController.updateMessageControls();
        UIController.clearMessages();

        AppState.clearProcessedMessages();
        
        const bufferedMessages = AppState.getMessages(user.userId);
        if (bufferedMessages.length > 0) {
            // Import MessageHandler dynamically to avoid circular dependency
            if (window.MessageHandler) {
                bufferedMessages.forEach(msg => {
                    if (!AppState.isMessageProcessed(msg.id)) {
                        AppState.markMessageProcessed(msg.id);
                        window.MessageHandler.displayMessage(
                            msg.message,
                            msg.type,
                            msg.fromUserId,
                            msg.timestamp
                        );
                    }
                });
            }
        } else {
            UIController.showWelcomeMessage(user.username);
        }
    },
    
    /**
     * Mark contact as unread
     */
    markContactUnread(userId) {
        const contactDiv = DOMManager.getById(`contact-${userId}`);
        if (contactDiv && !contactDiv.classList.contains('sc-contact--unread')) {
            contactDiv.classList.add('sc-contact--unread');
        }
    },
    
    /**
     * Setup socket listeners
     */
    setupSocketListeners() {
        socketManager.on('contact-added', (data) => {
            this.handleContactAdded(data);
        });
    }
};

// Make available globally for cross-module access
window.ContactHandler = ContactHandler;

export default ContactHandler;