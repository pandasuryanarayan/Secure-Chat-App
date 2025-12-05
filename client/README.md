# SecureChat Client

This is the frontend client for SecureChat, a secure end-to-end encrypted messaging application. The client provides a modern, responsive interface for private messaging with strong encryption and privacy features.

## Features

- **End-to-End Encryption**: All messages are encrypted on the client side using AES-256 and RSA-2048
- **Dark Mode Interface**: Modern dark-themed UI optimized for readability and reduced eye strain
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Real-Time Messaging**: Instant message delivery with typing indicators
- **Emoji Support**: Full emoji picker with categories and search
- **Auto-Expanding Textarea**: Smooth text input that expands as you type
- **Online Status**: See when contacts are online or offline
- **Unique 6-Digit ID**: Connect with others using simple 6-digit IDs instead of phone numbers
- **Message Formatting**: Support for multi-line messages and emoji

## Tech Stack

- **Vanilla JavaScript**: No frameworks, just pure JavaScript for optimal performance
- **Socket.IO Client**: Real-time bidirectional communication
- **Web Crypto API**: For client-side encryption and decryption
- **CSS3**: Modern styling with CSS variables and flexbox/grid layouts
- **HTML5**: Semantic markup
- **Emoji Picker Element**: Lightweight emoji picker library

## Project Structure

```
client
├── css
│   ├── index                      // Styles for main landing page
│   │   ├── components
│   │   │   ├── cta.css            // Call-to-action section styles
│   │   │   ├── features.css       // Feature highlights section
│   │   │   ├── footer.css         // Footer layout & styling
│   │   │   ├── hero.css           // Hero/banner section styles
│   │   │   ├── navbar.css         // Top navigation bar styles
│   │   │   ├── security.css       // Security feature section
│   │   │   └── steps.css          // How-it-works/steps section
│   │   ├── animations.css         // Shared animations
│   │   ├── base.css               // Base resets & typography
│   │   ├── layout.css             // Page-level layout helpers
│   │   ├── responsive.css         // Responsive breakpoints
│   │   └── variables.css          // CSS variables (colors, spacing)
│   ├── login                      // Styles for login/register views
│   │   ├── components
│   │   │   ├── buttons.css        // Auth buttons styling
│   │   │   ├── card.css           // Auth card/container styles
│   │   │   ├── form.css           // Form fields & validation UI
│   │   │   ├── messages.css       // Auth info/error messages
│   │   │   └── tabs.css           // Login/register tab switcher
│   │   ├── animations.css         // Login-specific animations
│   │   ├── base.css               // Base styles for login pages
│   │   ├── layout.css             // Layout for auth screens
│   │   ├── responsive.css         // Responsive login layouts
│   │   └── variables.css          // Auth theme variables
│   └── securechat-css             // In-app chat UI styles
│       ├── components
│       │   ├── buttons.css        // Chat action buttons
│       │   ├── chat.css           // Overall chat layout
│       │   ├── emoji-picker.css   // Emoji picker component
│       │   ├── header.css         // Chat header/top bar
│       │   ├── input.css          // Message input area
│       │   ├── messages.css       // Message bubbles & list
│       │   └── sidebar.css        // Sidebar & chat list
│       ├── animations.css         // Chat-specific animations
│       ├── base.css               // Base chat styles
│       ├── layout.css             // Layout utilities for chat
│       ├── responsive.css         // Responsive chat behavior
│       ├── utilities.css          // Helper utility classes
│       └── variables.css          // Chat theme variables
├── js
│   ├── chat
│   │   ├── api-handler.js             // Handles API requests to backend
│   │   ├── chat-init.js               // Main initialization
│   │   ├── config.js                  // Configuration & constants
│   │   ├── contact-handler.js         // Contact management
│   │   ├── dom-manager.js             // DOM element references
│   │   ├── emoji-picker-handler.js    // Emoji picker interactions
│   │   ├── encryption-handler.js      // Encryption & key exchange
│   │   ├── encryption.js              // Core encryption helpers
│   │   ├── event-listeners.js         // Event setup
│   │   ├── image-handler.js           // Image operations
│   │   ├── message-handler.js         // Message operations
│   │   ├── notification-handler.js    // Notifications & toasts
│   │   ├── socket-manager.js          // Socket.IO connection
│   │   ├── state-manager.js           // Global state management
│   │   ├── status-handler.js          // Online/offline status
│   │   ├── textarea-resize.js         // Auto-resize chat textarea
│   │   ├── ui-controller.js           // UI updates & controls
│   │   └── utils.js                   // Utility functions
│   ├── app-init.js                    // App-level initialization
│   └── auth.js                        // Authentication helpers
├── chat-round-icon.webp               // Chat app icon
├── chat.html                          // Chat interface page
├── index.html                         // Landing page
├── login.html                         // Login page
├── notification.png                   // Notification icon
└── README.md                          // Project documentation
```

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- SecureChat server running (see server README)

### Installation

1. Clone the repository
2. Navigate to the client directory
3. No build process required - this is a vanilla JavaScript application

### Running the Client

The client should be served through the SecureChat server. When you run the server, it will automatically serve the client files.

Access the application at:
```
http://localhost:3000
```

## Usage Guide

### Registration and Login

1. Visit the landing page and click "Login"
2. Choose "Register" tab to create a new account
3. Enter username, email, and password
4. After registration, you'll receive a unique 6-digit ID
5. Share this ID with friends to connect

### Adding Contacts

1. In the chat interface, enter a 6-digit ID in the sidebar
2. Click "Connect" to add the contact
3. The contact will appear in your contacts list
4. Both users will see each other in their contacts list

### Messaging

1. Select a contact from the sidebar
2. Type your message in the input area
3. Press Enter to send or Shift+Enter for a new line
4. Use the emoji button to add emojis
5. Messages are delivered instantly when both users are online

### Security Features

- Messages are encrypted with AES-256 before sending
- Key exchange uses RSA-2048
- Messages cannot be sent to offline users
- No message history is stored on the server
- Perfect forward secrecy is maintained

## Responsive Design

The interface adapts to different screen sizes:

- **Desktop**: Full sidebar and chat view side by side
- **Tablet**: Narrower sidebar with optimized chat area
- **Mobile**: Slide-out sidebar with hamburger menu and optimized mobile layout
- **Small Mobile**: Further optimized for very small screens

## Customization

### Theme

The application uses CSS variables for theming. You can modify the colors in css files.

### Fonts

The application uses the Inter font family. You can change this by modifying the `--font-primary` variable.

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Development

### Adding New Features

1. Create feature branch: `git checkout -b feature/your-feature-name`
2. Implement your changes
3. Test thoroughly in different browsers and screen sizes
4. Create pull request

### Code Style

- Use ES6+ features
- Add comments for complex logic
- Follow the existing naming conventions
- Test on multiple devices and browsers

## Troubleshooting

### Common Issues

- **Connection Error**: Make sure the server is running on port 3000
- **Messages Not Sending**: Verify both users are online
- **Emoji Picker Not Working**: Check if your browser supports the Web Components API

### Browser Console

Check the browser console (F12) for any error messages or warnings.

## Privacy and Security

- No messages are stored on the server
- All encryption/decryption happens in the browser
- User IDs are randomly generated
- No tracking or analytics

## License

This project is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

## Author

Developed by Surya