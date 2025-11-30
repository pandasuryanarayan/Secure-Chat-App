// ============================================
// UI CONTROLLER
// ============================================

import DOMManager from './dom-manager.js';
import AppState from './state-manager.js';

const UIController = {
    /**
     * Initialize user display
     */
    initUserDisplay() {
        const profileUsername = DOMManager.get('profileUsername');
        const profileUserId = DOMManager.get('profileUserId');
        const chatPartnerName = DOMManager.get('chatPartnerName');
        
        if (profileUsername) {
            profileUsername.textContent = localStorage.getItem('username') || 'User';
        }
        if (profileUserId) {
            profileUserId.textContent = localStorage.getItem('userId') || '';
        }
        if (chatPartnerName) {
            chatPartnerName.textContent = 'Select a contact';
        }
    },
    
    /**
     * Update message controls based on user status
     */
    updateMessageControls() {
        const { messageInput, sendBtn, emojiBtn, attachImageBtn } = DOMManager.getAll(
            'messageInput', 'sendBtn', 'emojiBtn', 'attachImageBtn'
        );
        
        if (!messageInput || !sendBtn) return;
        
        const currentUser = AppState.getCurrentChatUser();
        
        if (!currentUser) {
            this.disableControls(messageInput, sendBtn, emojiBtn, attachImageBtn, 
                'Select a contact to start chatting');
            return;
        }
        
        const isOnline = AppState.isUserOnline(currentUser);
        const keyExchangeComplete = AppState.getKeyExchangeStatus(currentUser);
        const user = AppState.getContact(currentUser);
        
        if (!isOnline) {
            this.disableControls(messageInput, sendBtn, emojiBtn, attachImageBtn,
                `${user?.username || 'User'} is offline`);
        } else if (!keyExchangeComplete) {
            this.disableControls(messageInput, sendBtn, emojiBtn, attachImageBtn,
                'Securing connection...');
        } else {
            this.enableControls(messageInput, sendBtn, emojiBtn, attachImageBtn,
                'Type a secure message...');
        }
    },
    
    /**
     * Disable message controls
     */
    disableControls(messageInput, sendBtn, emojiBtn, attachImageBtn, placeholder) {
        messageInput.disabled = true;
        sendBtn.disabled = true;
        if (emojiBtn) emojiBtn.disabled = true;
        if (attachImageBtn) attachImageBtn.disabled = true;
        messageInput.placeholder = placeholder;
    },
    
    /**
     * Enable message controls
     */
    enableControls(messageInput, sendBtn, emojiBtn, attachImageBtn, placeholder) {
        messageInput.disabled = false;
        sendBtn.disabled = false;
        if (emojiBtn) emojiBtn.disabled = false;
        if (attachImageBtn) attachImageBtn.disabled = false;
        messageInput.placeholder = placeholder;
    },
    
    /**
     * Update chat partner status
     */
    updateChatPartnerStatus(username, status, isOnline = false) {
        const chatPartnerName = DOMManager.get('chatPartnerName');
        const chatPartnerStatus = DOMManager.get('chatPartnerStatus');
        
        if (chatPartnerName) {
            chatPartnerName.textContent = username;
        }
        
        if (chatPartnerStatus) {
            chatPartnerStatus.textContent = status;
            chatPartnerStatus.className = isOnline 
                ? 'sc-chat__user-status sc-chat__user-status--online'
                : 'sc-chat__user-status';
        }
    },
    
    /**
     * Update contacts empty state
     */
    updateContactsEmptyState() {
        const contactsList = DOMManager.get('contactsList');
        if (!contactsList) return;
        
        const hasContacts = AppState.contacts.size > 0;
        
        if (!hasContacts) {
            contactsList.innerHTML = `
                <div class="sc-contacts__empty">
                    <div class="sc-contacts__empty-icon">
                        <svg class="sc-icon sc-icon--xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                    </div>
                    <p class="sc-contacts__empty-title">No contacts yet</p>
                    <p class="sc-contacts__empty-subtitle">Add someone to start chatting</p>
                </div>
            `;
        } else {
            const emptyState = contactsList.querySelector('.sc-contacts__empty');
            if (emptyState) {
                emptyState.remove();
            }
        }
    },
    
    /**
     * Show typing indicator
     */
    showTypingIndicator(username) {
        const typingIndicator = DOMManager.get('typingIndicator');
        const typingUserName = DOMManager.get('typingUserName');
        
        if (!typingIndicator) return;
        
        if (typingUserName) {
            typingUserName.textContent = username;
        }
        typingIndicator.classList.add('sc-typing--visible');
    },
    
    /**
     * Hide typing indicator
     */
    hideTypingIndicator() {
        const typingIndicator = DOMManager.get('typingIndicator');
        if (typingIndicator) {
            typingIndicator.classList.remove('sc-typing--visible');
        }
    },
    
    /**
     * Clear messages container
     */
    clearMessages() {
        const messagesContainer = DOMManager.get('messagesContainer');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
        }
    },
    
    /**
     * Show welcome message
     */
    showWelcomeMessage(username) {
        const messagesContainer = DOMManager.get('messagesContainer');
        if (!messagesContainer) return;
        
        messagesContainer.innerHTML = `
            <div class="sc-welcome sc-welcome--mini">
                <div class="sc-welcome__icon">
                    <svg class="sc-icon sc-icon--xl" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </div>
                <p class="sc-welcome__description">Start a conversation with ${username}</p>
            </div>
        `;
    }
};

export default UIController;