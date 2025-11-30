// ============================================
// GLOBAL STATE MANAGEMENT
// ============================================

import E2EEncryption from './encryption.js';

const AppState = {
    // Core instances
    encryption: new E2EEncryption(),
    socket: null,
    
    // User state
    currentChatUser: null,
    
    // Collections
    contacts: new Map(),
    onlineUsers: new Set(),
    messageBuffer: new Map(),
    processedMessages: new Set(),
    keyExchangeStatus: new Map(),
    imageChunks: new Map(),
    
    // Timeouts
    typingTimeout: null,
    
    // Methods to manage state
    setSocket(socketInstance) {
        this.socket = socketInstance;
    },
    
    setCurrentChatUser(userId) {
        this.currentChatUser = userId;
    },
    
    getCurrentChatUser() {
        return this.currentChatUser;
    },
    
    addContact(userId, userData) {
        this.contacts.set(userId, userData);
    },
    
    getContact(userId) {
        return this.contacts.get(userId);
    },
    
    hasContact(userId) {
        return this.contacts.has(userId);
    },
    
    setUserOnline(userId) {
        this.onlineUsers.add(userId);
    },
    
    setUserOffline(userId) {
        this.onlineUsers.delete(userId);
    },
    
    isUserOnline(userId) {
        return this.onlineUsers.has(userId);
    },
    
    setKeyExchangeStatus(userId, status) {
        this.keyExchangeStatus.set(userId, status);
    },
    
    getKeyExchangeStatus(userId) {
        return this.keyExchangeStatus.get(userId) === true;
    },
    
    isUserReadyToChat(userId) {
        return this.isUserOnline(userId) && this.getKeyExchangeStatus(userId);
    },
    
    addMessage(userId, messageData) {
        if (!this.messageBuffer.has(userId)) {
            this.messageBuffer.set(userId, []);
        }
        this.messageBuffer.get(userId).push(messageData);
    },
    
    getMessages(userId) {
        return this.messageBuffer.get(userId) || [];
    },
    
    markMessageProcessed(messageId) {
        this.processedMessages.add(messageId);
    },
    
    isMessageProcessed(messageId) {
        return this.processedMessages.has(messageId);
    },
    
    clearProcessedMessages() {
        this.processedMessages.clear();
    },
    
    reset() {
        this.currentChatUser = null;
        this.contacts.clear();
        this.onlineUsers.clear();
        this.messageBuffer.clear();
        this.processedMessages.clear();
        this.keyExchangeStatus.clear();
        this.imageChunks.clear();
        this.typingTimeout = null;
    }
};

export default AppState;