// ============================================
// IMAGE HANDLER
// ============================================

import CONFIG from './config.js';
import AppState from './state-manager.js';
import DOMManager from './dom-manager.js';
import socketManager from './socket-manager.js';
import NotificationHandler from './notification-handler.js';
import ContactHandler from './contact-handler.js';
import Utils from './utils.js';
import ApiHandler from './api-handler.js';

const ImageHandler = {
    /**
     * Compress image with quality adjustment
     */
    async compressImage(file, maxWidth = null, maxHeight = null, targetSizeMB = null) {
        maxWidth = maxWidth || CONFIG.IMAGE.COMPRESSION.MAX_WIDTH;
        maxHeight = maxHeight || CONFIG.IMAGE.COMPRESSION.MAX_HEIGHT;
        targetSizeMB = targetSizeMB || CONFIG.IMAGE.COMPRESSION.TARGET_SIZE_MB;
        
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = () => {
                    let quality = CONFIG.IMAGE.COMPRESSION.INITIAL_QUALITY;
                    let width = img.width;
                    let height = img.height;
                    
                    if (width > height) {
                        if (width > maxWidth) {
                            height = Math.round(height * (maxWidth / width));
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width = Math.round(width * (maxHeight / height));
                            height = maxHeight;
                        }
                    }
                    
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    const tryCompress = (q) => {
                        return new Promise((resolveBlob) => {
                            canvas.toBlob((blob) => {
                                resolveBlob(blob);
                            }, 'image/jpeg', q);
                        });
                    };
                    
                    const compress = async () => {
                        let blob = await tryCompress(quality);
                        const targetSize = targetSizeMB * 1024 * 1024;
                        
                        while (blob.size > targetSize && quality > CONFIG.IMAGE.COMPRESSION.MIN_QUALITY) {
                            quality -= 0.1;
                            blob = await tryCompress(quality);
                        }
                        
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now()
                        }));
                    };
                    
                    compress();
                };
                img.onerror = () => resolve(file);
            };
            reader.onerror = () => resolve(file);
        });
    },
    
    /**
     * Upload image via HTTP
     */
    async uploadImage(file, targetUserId) {
        // Check if user is ready to chat
        if (!AppState.isUserReadyToChat(targetUserId)) {
            NotificationHandler.showToast('Cannot send image. User is offline or connection not secured.', 'error');
            return false;
        }
        
        try {
            NotificationHandler.showToast('Processing image...');
            
            let fileToUpload = file;
            if (file.size > 1 * 1024 * 1024) {
                NotificationHandler.showToast('Compressing image...');
                fileToUpload = await this.compressImage(file);
            }
            
            NotificationHandler.showToast('Encrypting image...');
            
            const arrayBuffer = await fileToUpload.arrayBuffer();
            const { encrypted, iv } = await AppState.encryption.encryptFile(arrayBuffer, targetUserId);
            
            const messageId = Utils.generateRandomId('img-');
            
            const chunks = [];
            const chunkSize = CONFIG.IMAGE.CHUNK_SIZE;
            
            for (let i = 0; i < encrypted.length; i += chunkSize) {
                chunks.push(encrypted.slice(i, i + chunkSize));
            }
            
            if (chunks.length > 1) {
                await this.uploadInChunks(messageId, chunks, targetUserId, fileToUpload, file, iv);
            } else {
                await this.uploadSingle(messageId, encrypted, targetUserId, fileToUpload, file, iv);
            }
            
            this.displayImageMessage({
                messageId,
                encrypted,
                iv,
                fileName: fileToUpload.name,
                fileType: fileToUpload.type,
                fileSize: fileToUpload.size
            }, true);
            
            socketManager.emit('image-notification', {
                targetUserId,
                messageId,
                senderInfo: {
                    userId: localStorage.getItem('userId'),
                    username: localStorage.getItem('username')
                }
            });
            
            NotificationHandler.showToast('Image sent!', 'success');
            return true;
            
        } catch (error) {
            if (error.message !== 'SESSION_EXPIRED') {
                console.error('Error uploading image:', error);
                NotificationHandler.showToast('Failed to send image', 'error');
            }
            return false;
        }
    },
    
    /**
     * Upload image in chunks
     */
    async uploadInChunks(messageId, chunks, targetUserId, fileToUpload, originalFile, iv) {
        NotificationHandler.showToast(`Uploading in ${chunks.length} parts...`);
        
        const metadataResponse = await ApiHandler.post('/image/metadata', {
            messageId,
            targetUserId,
            fileName: fileToUpload.name,
            fileType: fileToUpload.type,
            fileSize: fileToUpload.size,
            originalSize: originalFile.size,
            totalChunks: chunks.length,
            iv
        });
        
        if (!metadataResponse.ok) {
            throw new Error('Failed to send metadata');
        }
        
        for (let i = 0; i < chunks.length; i++) {
            const chunkResponse = await ApiHandler.post('/image/chunk', {
                messageId,
                chunkIndex: i,
                chunkData: chunks[i],
                isLastChunk: i === chunks.length - 1
            });
            
            if (!chunkResponse.ok) {
                throw new Error(`Failed to upload chunk ${i + 1}`);
            }
            
            const progress = Math.round(((i + 1) / chunks.length) * 100);
            if (progress % 25 === 0) {
                NotificationHandler.showToast(`Uploading: ${progress}%`);
            }
        }
    },
    
    /**
     * Upload single image
     */
    async uploadSingle(messageId, encrypted, targetUserId, fileToUpload, originalFile, iv) {
        NotificationHandler.showToast('Uploading image...');
        
        const response = await ApiHandler.post('/image/upload', {
            messageId,
            targetUserId,
            encryptedData: encrypted,
            iv,
            fileName: fileToUpload.name,
            fileType: fileToUpload.type,
            fileSize: fileToUpload.size,
            originalSize: originalFile.size
        });
        
        if (!response.ok) {
            throw new Error('Upload failed');
        }
    },
    
    /**
     * Handle image notification
     */
    async handleImageNotification(data) {
        try {
            const response = await ApiHandler.get(`/image/${data.messageId}`);
            
            if (response.ok) {
                const imageData = await response.json();
                const currentUser = AppState.getCurrentChatUser();
                
                if (data.fromUserId === currentUser) {
                    this.displayImageMessage(imageData, false, data.senderInfo);
                    
                    const messageDiv = DOMManager.querySelector(`[data-message-id="${imageData.messageId}"]`);
                    if (messageDiv) {
                        const img = messageDiv.querySelector('img');
                        if (img) {
                            const decryptedBuffer = await AppState.encryption.decryptFile(
                                imageData.encryptedData,
                                imageData.iv,
                                data.fromUserId
                            );
                            
                            const blob = new Blob([decryptedBuffer], { type: imageData.fileType });
                            const url = URL.createObjectURL(blob);
                            
                            img.src = url;
                            img.classList.remove('loading');
                        }
                    }
                } else {
                    const sender = AppState.getContact(data.fromUserId);
                    NotificationHandler.showBrowserNotification(
                        sender?.username || 'New Image',
                        'Sent you an image'
                    );
                    
                    ContactHandler.markContactUnread(data.fromUserId);
                }
            }
        } catch (error) {
            if (error.message !== 'SESSION_EXPIRED') {
                console.error('Error fetching image:', error);
            }
        }
    },
    
    /**
     * Display image message
     */
    displayImageMessage(imageData, isSent = false, senderInfo = null) {
        const messagesContainer = DOMManager.get('messagesContainer');
        if (!messagesContainer) return;
        
        const welcomeMessage = messagesContainer.querySelector('.sc-welcome');
        if (welcomeMessage) welcomeMessage.remove();
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `sc-message sc-message--${isSent ? 'sent' : 'received'}`;
        messageDiv.dataset.messageId = imageData.messageId;
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'sc-message__bubble';
        
        if (!isSent && senderInfo) {
            const senderName = document.createElement('div');
            senderName.className = 'sc-message__sender';
            senderName.textContent = senderInfo.username || 'Unknown';
            bubbleDiv.appendChild(senderName);
        }
        
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'sc-message__image-wrapper';
        
        const img = document.createElement('img');
        img.className = 'sc-message__image loading';
        img.alt = isSent ? 'Sent image' : 'Received image';
        
        const timeDiv = document.createElement('div');
        timeDiv.className = 'sc-message__time-overlay';
        timeDiv.textContent = Utils.formatTime();
        
        if (isSent) {
            (async () => {
                try {
                    const currentUser = AppState.getCurrentChatUser();
                    const decryptedBuffer = await AppState.encryption.decryptFile(
                        imageData.encrypted,
                        imageData.iv,
                        currentUser
                    );
                    const blob = new Blob([decryptedBuffer], { type: imageData.fileType });
                    const url = URL.createObjectURL(blob);
                    img.src = url;
                    img.classList.remove('loading');
                } catch (error) {
                    console.error('Error displaying sent image:', error);
                    img.alt = 'Error loading image';
                    img.classList.remove('loading');
                }
            })();
        }
        
        imageWrapper.appendChild(img);
        imageWrapper.appendChild(timeDiv);
        bubbleDiv.appendChild(imageWrapper);
        
        messageDiv.appendChild(bubbleDiv);
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },
    
    /**
     * Handle file input change
     */
    async handleFileSelect(file) {
        if (!file) return false;
        
        if (!file.type.startsWith('image/')) {
            NotificationHandler.showToast('Please select an image file', 'error');
            return false;
        }
        
        if (file.size > CONFIG.IMAGE.MAX_SIZE) {
            NotificationHandler.showToast('Image size should be less than 10MB', 'error');
            return false;
        }
        
        const currentUser = AppState.getCurrentChatUser();
        
        if (!currentUser || !AppState.isUserReadyToChat(currentUser)) {
            NotificationHandler.showToast('User is offline or connection not secured', 'error');
            return false;
        }
        
        return await this.uploadImage(file, currentUser);
    },
    
    /**
     * Setup socket listeners
     */
    setupSocketListeners() {
        socketManager.on('image-notification', (data) => {
            this.handleImageNotification(data);
        });
    }
};

export default ImageHandler;