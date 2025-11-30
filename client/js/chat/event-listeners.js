// ============================================
// EVENT LISTENERS SETUP
// ============================================

import DOMManager from './dom-manager.js';
import ContactHandler from './contact-handler.js';
import MessageHandler from './message-handler.js';
import ImageHandler from './image-handler.js';
import Utils from './utils.js';
import ApiHandler from './api-handler.js';

const EventListeners = {
    /**
     * Setup all event listeners
     */
    setup() {
        this.setupAuthCheck();
        this.setupCopyIdButton();
        this.setupConnectButton();
        this.setupMessageControls();
        this.setupImageControls();
        this.setupLogoutButton();
    },
    
    /**
     * Check authentication
     */
    setupAuthCheck() {
        if (!localStorage.getItem('token')) {
            window.location.href = './login.html';
        }
    },
    
    /**
     * Copy ID button
     */
    setupCopyIdButton() {
        const copyIdBtn = DOMManager.get('copyIdBtn');
        
        if (copyIdBtn) {
            copyIdBtn.addEventListener('click', async () => {
                const userId = localStorage.getItem('userId');
                
                const success = await Utils.copyToClipboard(userId);
                
                if (success) {
                    // Store original content
                    const originalHTML = copyIdBtn.innerHTML;
                    
                    // Add success state
                    copyIdBtn.classList.add('sc-profile__copy-btn--copied');
                    
                    // Change to checkmark icon
                    copyIdBtn.innerHTML = `
                        <svg class="sc-icon sc-icon--xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                        <span class="sc-profile__copy-text">Copied!</span>
                    `;
                    
                    // Reset after 2 seconds
                    setTimeout(() => {
                        copyIdBtn.classList.remove('sc-profile__copy-btn--copied');
                        copyIdBtn.innerHTML = originalHTML;
                    }, 2000);
                }
            });
        }
    },
    
    /**
     * Connect button and search input
     */
    setupConnectButton() {
        const connectBtn = DOMManager.get('connectBtn');
        const contactSearchInput = DOMManager.get('contactSearchInput');
        
        if (connectBtn) {
            connectBtn.addEventListener('click', async () => {
                const searchId = contactSearchInput?.value.trim();
                
                const success = await ContactHandler.addContact(searchId);
                
                if (success && contactSearchInput) {
                    contactSearchInput.value = '';
                }
            });
        }
        
        // Allow Enter key to connect
        if (contactSearchInput) {
            contactSearchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    connectBtn?.click();
                }
            });
        }
    },
    
    /**
     * Message input and send button
     */
    setupMessageControls() {
        const sendBtn = DOMManager.get('sendBtn');
        const messageInput = DOMManager.get('messageInput');
        
        if (sendBtn) {
            sendBtn.addEventListener('click', async () => {
                if (!messageInput) return;
                
                const message = messageInput.value.trim();
                
                if (!message) return;
                
                const success = await MessageHandler.sendMessage(message);
                
                if (success) {
                    if (window.resetTextareaHeight) {
                        window.resetTextareaHeight();
                    } else {
                        messageInput.value = '';
                        messageInput.style.height = 'auto';
                    }
                }
            });
        }
        
        if (messageInput) {
            messageInput.addEventListener('input', () => {
                MessageHandler.handleTyping();
            });
            
            // Allow Enter key to send (Shift+Enter for new line)
            messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendBtn?.click();
                }
            });
        }
    },
    
    /**
     * Image upload controls
     */
    setupImageControls() {
        const attachImageBtn = DOMManager.get('attachImageBtn');
        const imageInput = DOMManager.get('imageInput');
        
        if (attachImageBtn) {
            attachImageBtn.addEventListener('click', () => {
                imageInput?.click();
            });
        }
        
        if (imageInput) {
            imageInput.addEventListener('change', async (e) => {
                const file = e.target.files[0];
                
                await ImageHandler.handleFileSelect(file);
                
                // Clear input
                e.target.value = '';
            });
        }
    },
    
    /**
     * Logout button
     */
    setupLogoutButton() {
        const logoutBtn = DOMManager.get('logoutBtn');
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async () => {
                // Use centralized logout from ApiHandler
                await ApiHandler.logout();
            });
        }
    }
};

export default EventListeners;