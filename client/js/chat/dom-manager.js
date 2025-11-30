// ============================================
// DOM ELEMENT MANAGER
// ============================================

const DOMManager = {
    // Cache for DOM elements
    cache: {},
    
    // Element IDs mapping
    elements: {
        // Profile
        profileUsername: 'profileUsername',
        profileUserId: 'profileUserId',
        copyIdBtn: 'copyIdBtn',
        
        // Search/Connect
        contactSearchInput: 'contactSearchInput',
        connectBtn: 'connectBtn',
        
        // Contacts
        contactsList: 'contactsList',
        
        // Chat Header
        chatPartnerName: 'chatPartnerName',
        chatPartnerStatus: 'chatPartnerStatus',
        
        // Messages
        messagesContainer: 'messagesContainer',
        
        // Input
        messageInput: 'messageInput',
        sendBtn: 'sendBtn',
        emojiBtn: 'emojiBtn',
        attachImageBtn: 'attachImageBtn',
        imageInput: 'imageInput',
        
        // Typing
        typingIndicator: 'typingIndicator',
        typingUserName: 'typingUserName',
        
        // Other
        logoutBtn: 'logoutBtn',
        toastNotification: 'toastNotification'
    },
    
    // Get element by key with caching
    get(key) {
        // Return from cache if exists
        if (this.cache[key]) {
            return this.cache[key];
        }
        
        // Get element ID
        const elementId = this.elements[key];
        if (!elementId) {
            console.warn(`No element ID found for key: ${key}`);
            return null;
        }
        
        // Get element and cache it
        const element = document.getElementById(elementId);
        if (element) {
            this.cache[key] = element;
        }
        
        return element;
    },
    
    // Get multiple elements
    getAll(...keys) {
        const result = {};
        keys.forEach(key => {
            result[key] = this.get(key);
        });
        return result;
    },
    
    // Clear cache (useful for dynamic content)
    clearCache(key = null) {
        if (key) {
            delete this.cache[key];
        } else {
            this.cache = {};
        }
    },
    
    // Helper to check if element exists
    exists(key) {
        return this.get(key) !== null;
    },
    
    // Get element by ID directly (bypass cache)
    getById(id) {
        return document.getElementById(id);
    },
    
    // Query selector helpers
    querySelector(selector) {
        return document.querySelector(selector);
    },
    
    querySelectorAll(selector) {
        return document.querySelectorAll(selector);
    }
};

export default DOMManager;