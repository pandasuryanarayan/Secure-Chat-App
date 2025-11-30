// ============================================
// SOCKET.IO CONNECTION MANAGER
// ============================================

import CONFIG from './config.js';
import AppState from './state-manager.js';

class SocketManager {
    constructor() {
        this.socket = null;
        this.isInitialized = false;
    }
    
    initialize() {
        if (this.isInitialized) {
            console.warn('Socket already initialized');
            return this.socket;
        }
        
        try {
            const transports = CONFIG.IS_PRODUCTION 
                ? ['polling', 'websocket'] 
                : ['websocket', 'polling'];
            
            this.socket = io(CONFIG.SERVER_URL, {
                transports,
                ...CONFIG.SOCKET_CONFIG
            });
            
            this.setupConnectionHandlers();
            AppState.setSocket(this.socket);
            this.isInitialized = true;
            
            console.log('Socket.IO initialized');
            return this.socket;
            
        } catch (error) {
            console.error('Failed to initialize Socket.IO:', error);
            alert('Failed to initialize chat connection.');
            throw error;
        }
    }
    
    setupConnectionHandlers() {
        this.socket.on('connect', () => {
            console.log('Connected to server via:', this.socket.io.engine.transport.name);
            this.handleConnect();
        });
        
        this.socket.on('connect_error', (error) => {
            console.error('Connection error:', error.message);
        });
        
        this.socket.on('disconnect', (reason) => {
            console.log('Disconnected:', reason);
            if (reason === 'io server disconnect') {
                this.socket.connect();
            }
        });
    }
    
    handleConnect() {
        const userId = localStorage.getItem('userId');
        const username = localStorage.getItem('username');
        
        if (userId && username) {
            this.socket.emit('join', { userId, username });
        }
    }
    
    on(event, callback) {
        if (this.socket) {
            this.socket.on(event, callback);
        }
    }
    
    emit(event, data) {
        if (this.socket) {
            this.socket.emit(event, data);
        }
    }
    
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.isInitialized = false;
        }
    }
    
    getSocket() {
        return this.socket;
    }
}

// Export singleton instance
const socketManager = new SocketManager();
export default socketManager;