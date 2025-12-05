// ============================================
// APPLICATION CONFIGURATION
// ============================================

const CONFIG = {
    // Server Configuration
    SERVER_URL: 'http://localhost:3000',
    
    get API_URL() {
        return `${this.SERVER_URL}/api`;
    },
    
    get IS_PRODUCTION() {
        return this.SERVER_URL.includes('onrender.com') || !this.SERVER_URL.includes('localhost');
    },
    
    // Socket.IO Configuration
    SOCKET_CONFIG: {
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
        maxHttpBufferSize: 1e6,
        pingTimeout: 60000,
        pingInterval: 25000,
        upgrade: true,
        rememberUpgrade: true
    },
    
    // Image Configuration
    IMAGE: {
        MAX_SIZE: 10 * 1024 * 1024,      // 10MB
        CHUNK_SIZE: 500 * 1024,           // 500KB
        COMPRESSION: {
            MAX_WIDTH: 1920,
            MAX_HEIGHT: 1080,
            TARGET_SIZE_MB: 0.8,
            INITIAL_QUALITY: 0.9,
            MIN_QUALITY: 0.1
        }
    },
    
    // Message Configuration
    MESSAGE: {
        TYPING_TIMEOUT: 1000
    },
    
    // Toast Configuration
    TOAST: {
        DURATION: 3000
    }
};

// Freeze config to prevent modifications
Object.freeze(CONFIG);
Object.freeze(CONFIG.SOCKET_CONFIG);
Object.freeze(CONFIG.IMAGE);
Object.freeze(CONFIG.IMAGE.COMPRESSION);
Object.freeze(CONFIG.MESSAGE);
Object.freeze(CONFIG.TOAST);

export default CONFIG;