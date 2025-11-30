// ============================================
// UTILITY FUNCTIONS
// ============================================

const Utils = {
    /**
     * Generate unique message ID
     */
    generateMessageId(message, timestamp, userId) {
        return `${userId}-${timestamp}-${message.substring(0, 10)}`;
    },
    
    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    /**
     * Format timestamp for display
     */
    formatTime(timestamp = new Date()) {
        return timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    },
    
    /**
     * Copy text to clipboard
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            return this.fallbackCopyToClipboard(text);
        }
    },
    
    /**
     * Fallback copy method
     */
    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        } catch (err) {
            document.body.removeChild(textArea);
            return false;
        }
    },
    
    /**
     * Generate random ID
     */
    generateRandomId(prefix = '') {
        const random = Math.random().toString(36).substr(2, 9);
        const timestamp = Date.now();
        return `${prefix}${timestamp}-${random}`;
    },
    
    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    /**
     * Check if value is valid
     */
    isValid(value) {
        return value !== null && value !== undefined && value !== '';
    },
    
    /**
     * Safe JSON parse
     */
    safeJsonParse(json, defaultValue = null) {
        try {
            return JSON.parse(json);
        } catch (e) {
            return defaultValue;
        }
    },
    
    /**
     * Format file size
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }
};

export default Utils;