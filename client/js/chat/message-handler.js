// ============================================
// MESSAGE HANDLER
// ============================================

import CONFIG from './config.js';
import AppState from './state-manager.js';
import DOMManager from './dom-manager.js';
import UIController from './ui-controller.js';
import socketManager from './socket-manager.js';
import NotificationHandler from './notification-handler.js';
import ContactHandler from './contact-handler.js';
import Utils from './utils.js';
import ApiHandler from './api-handler.js';

const MessageHandler = {
    /**
     * Send a text message
     */
    async sendMessage(messageText) {
        const currentUser = AppState.getCurrentChatUser();
        
        if (!messageText || !currentUser) return false;
        
        // Check if user is online
        if (!AppState.isUserOnline(currentUser)) {
            const user = AppState.getContact(currentUser);
            NotificationHandler.showToast(`${user?.username || 'User'} is offline`, 'error');
            return false;
        }
        
        // Check if key exchange is complete
        if (!AppState.getKeyExchangeStatus(currentUser)) {
            NotificationHandler.showToast('Securing connection, please wait...', 'error');
            return false;
        }
        
        try {
            const { encrypted, iv } = await AppState.encryption.encryptMessage(
                messageText,
                currentUser
            );
            const timestamp = new Date();
            const messageId = Utils.generateMessageId(
                messageText,
                timestamp.getTime(),
                localStorage.getItem('userId')
            );
            
            socketManager.emit('encrypted-message', {
                targetUserId: currentUser,
                encryptedMessage: encrypted,
                iv: iv,
                messageId: messageId,
                senderInfo: {
                    userId: localStorage.getItem('userId'),
                    username: localStorage.getItem('username')
                }
            });
            
            // Store in buffer
            this.storeMessage(currentUser, messageText, 'sent', timestamp, messageId);
            AppState.markMessageProcessed(messageId);
            
            // Display message
            this.displayMessage(messageText, 'sent');
            
            return true;
        } catch (error) {
            console.error('Error sending message:', error);
            NotificationHandler.showToast('Error sending message', 'error');
            return false;
        }
    },
    
    /**
     * Handle received message
     */
    async handleReceivedMessage(data) {
        try {
            const messageId = data.messageId || `${data.fromUserId}-${new Date(data.timestamp).getTime()}`;
            
            if (AppState.isMessageProcessed(messageId)) {
                return;
            }
            
            // Add contact if not exists
            if (!AppState.hasContact(data.fromUserId)) {
                await this.addUnknownContact(data.fromUserId);
            }
            
            // Decrypt message
            const decryptedMessage = await AppState.encryption.decryptMessage(
                data.encryptedMessage,
                data.iv,
                data.fromUserId
            );
            
            AppState.markMessageProcessed(messageId);
            this.storeMessage(
                data.fromUserId,
                decryptedMessage,
                'received',
                new Date(data.timestamp),
                messageId
            );
            
            const currentUser = AppState.getCurrentChatUser();
            
            if (currentUser === data.fromUserId) {
                // Display if this is current chat
                this.displayMessage(
                    decryptedMessage,
                    'received',
                    data.fromUserId,
                    new Date(data.timestamp)
                );
            } else {
                // Show notification
                const sender = AppState.getContact(data.fromUserId);
                NotificationHandler.showBrowserNotification(
                    sender?.username || 'New Message',
                    decryptedMessage
                );
                
                // Mark contact as unread
                ContactHandler.markContactUnread(data.fromUserId);
            }
            
        } catch (error) {
            console.error('Error decrypting message:', error);
        }
    },
    
    /**
     * Handle pending messages from server
     */
    async handlePendingMessages(data) {
        const { messages, fromUserId } = data;
        
        for (const msgData of messages) {
            try {
                const messageId = `${msgData.id || Date.now()}-${fromUserId}`;
                
                if (AppState.isMessageProcessed(messageId)) {
                    continue;
                }
                
                const decryptedMessage = await AppState.encryption.decryptMessage(
                    msgData.encryptedMessage,
                    msgData.iv,
                    fromUserId
                );
                
                this.storeMessage(
                    fromUserId,
                    decryptedMessage,
                    'received',
                    new Date(msgData.timestamp),
                    messageId
                );
                
                const currentUser = AppState.getCurrentChatUser();
                
                if (currentUser === fromUserId) {
                    AppState.markMessageProcessed(messageId);
                    this.displayMessage(
                        decryptedMessage,
                        'received',
                        fromUserId,
                        new Date(msgData.timestamp)
                    );
                } else {
                    ContactHandler.markContactUnread(fromUserId);
                }
            } catch (error) {
                console.error('Error decrypting pending message:', error);
            }
        }
    },
    
    /**
     * Store message in buffer
     */
    storeMessage(userId, message, type, timestamp = new Date(), messageId = null) {
        const id = messageId || Utils.generateMessageId(
            message,
            timestamp.getTime(),
            userId
        );
        
        const existingMessages = AppState.getMessages(userId);
        const exists = existingMessages.some(msg => msg.id === id);
        
        if (!exists) {
            AppState.addMessage(userId, {
                id,
                message,
                type,
                timestamp,
                fromUserId: type === 'received' ? userId : localStorage.getItem('userId')
            });
        }
    },
    
    /**
     * Display message in chat
     */
    displayMessage(message, type, fromUserId = null, timestamp = new Date()) {
        const messagesContainer = DOMManager.get('messagesContainer');
        if (!messagesContainer) return;
        
        // Remove welcome message
        const welcomeMessage = messagesContainer.querySelector('.sc-welcome');
        if (welcomeMessage) welcomeMessage.remove();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `sc-message sc-message--${type}`;
        
        const time = Utils.formatTime(timestamp);
        
        let senderName = '';
        if (type === 'received' && fromUserId) {
            const sender = AppState.getContact(fromUserId);
            senderName = `<div class="sc-message__sender">${sender?.username || 'Unknown'}</div>`;
        }
        
        messageDiv.innerHTML = `
            <div class="sc-message__bubble">
                ${senderName}
                <div class="sc-message__text">${Utils.escapeHtml(message)}</div>
                <div class="sc-message__time">${time}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    
    /**
     * Add unknown contact (when receiving message from new user)
     */
    async addUnknownContact(userId) {
        try {
            const response = await ApiHandler.get(`/user/${userId}`);
            
            if (response.ok) {
                const user = await response.json();
                AppState.addContact(user.userId, user);
                AppState.setUserOnline(user.userId);
                UIController.updateContactsEmptyState();
                ContactHandler.displayContact(user);
            }
        } catch (error) {
            if (error.message !== 'SESSION_EXPIRED') {
                console.error('Error fetching unknown contact:', error);
            }
        }
    },
    
    /**
     * Handle typing indicator
     */
    handleTyping() {
        const currentUser = AppState.getCurrentChatUser();
        
        if (!currentUser || !AppState.isUserReadyToChat(currentUser)) {
            return;
        }
        
        socketManager.emit('typing', {
            targetUserId: currentUser,
            isTyping: true
        });
        
        clearTimeout(AppState.typingTimeout);
        AppState.typingTimeout = setTimeout(() => {
            socketManager.emit('typing', {
                targetUserId: currentUser,
                isTyping: false
            });
        }, CONFIG.MESSAGE.TYPING_TIMEOUT);
    },
    
    /**
     * Handle user typing event
     */
    handleUserTyping(data) {
        const currentUser = AppState.getCurrentChatUser();
        
        if (data.isTyping && data.userId === currentUser) {
            const user = AppState.getContact(data.userId);
            UIController.showTypingIndicator(user?.username || 'User');
        } else {
            UIController.hideTypingIndicator();
        }
    },
    
    /**
     * Setup socket listeners
     */
    setupSocketListeners() {
        socketManager.on('receive-message', (data) => {
            this.handleReceivedMessage(data);
        });
        
        socketManager.on('pending-messages', (data) => {
            this.handlePendingMessages(data);
        });
        
        socketManager.on('user-typing', (data) => {
            this.handleUserTyping(data);
        });
    }
};

// Make available globally
window.MessageHandler = MessageHandler;

export default MessageHandler;