# SecureChat

![SecureChat Banner](client/chat-round-icon.webp)

**Secure End-to-End Encrypted Messaging Application**

SecureChat is a modern, privacy-focused messaging application that ensures your conversations remain private. With military-grade end-to-end encryption, zero-knowledge architecture, and a simple 6-digit ID system, SecureChat offers a secure alternative to traditional messaging platforms.

---

## 🚀 Features

### 🔒 Security & Privacy
- **End-to-End Encryption**: All messages are encrypted on the client side using **AES-256-GCM** and **RSA-2048** before they ever leave your device.
- **Zero-Knowledge Architecture**: The server acts only as a relay. It cannot read, decrypt, or store your messages permanently.
- **Perfect Forward Secrecy**: Unique session keys ensure that past communications remain secure even if long-term keys are compromised.
- **No Data Collection**: We do not store message history, metadata, or track user activity.
- **Secure Authentication**: JWT-based authentication with token blacklisting for secure logout.

### 💬 Messaging Experience
- **Real-Time Communication**: Instant message delivery using Socket.IO.
- **Offline Messaging**: Messages sent to offline users are temporarily buffered (encrypted) and delivered when they come online.
- **Image Sharing**: Share images securely with end-to-end encryption.
- **Typing Indicators**: See when your contact is typing.
- **Read Receipts**: Know when your messages have been delivered.
- **Emoji Support**: Integrated emoji picker for expressive conversations.

### 👤 User Experience
- **Simple Identity**: Connect with others using a unique, random **6-digit ID**. No phone numbers or email addresses required for discovery.
- **Modern UI**: Dark-themed, responsive interface designed for readability and ease of use.
- **Cross-Platform**: Works seamlessly on desktop, tablet, and mobile browsers.

---

## 🛠️ Tech Stack

### Client (Frontend)
- **Vanilla JavaScript**: Lightweight and fast, with no heavy framework overhead.
- **Web Crypto API**: Native browser API for high-performance cryptography.
- **Socket.IO Client**: For real-time, bidirectional event-based communication.
- **CSS3**: Modern styling with Flexbox/Grid and CSS variables.

### Server (Backend)
- **Node.js & Express**: Robust and scalable server environment.
- **Socket.IO**: Handles real-time websocket connections.
- **MongoDB & Mongoose**: Stores user accounts (hashed passwords) and temporary offline message buffers.
- **JWT (JSON Web Tokens)**: Stateless authentication mechanism.
- **Bcrypt**: Strong password hashing.

---

## 📂 Project Structure

The project is organized into two main directories:

```
.
├── client/                 # Frontend application
│   ├── css/                # Stylesheets (modularized)
│   ├── js/                 # JavaScript logic (crypto, socket, UI)
│   ├── index.html          # Landing page
│   ├── login.html          # Authentication page
│   ├── chat.html           # Main chat interface
│   └── ...
└── server/                 # Backend application
    ├── middleware/         # Auth and validation middleware
    ├── models/             # Mongoose database models
    ├── index.js            # Server entry point
    └── ...
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (Local instance or Atlas URI)
- Modern Web Browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/secure-chat-app.git
   cd secure-chat-app
   ```

2. **Setup the Server**
   Navigate to the server directory and install dependencies:
   ```bash
   cd server
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the `server` directory with the following variables:
   ```env
   MONGODB_URI=mongodb://localhost:27017/securechat
   JWT_SECRET=your_super_secret_jwt_key
   PORT=3000
   ```

4. **Start the Application**

   **Development Mode:**
   ```bash
   npm run dev
   ```

   **Production Mode:**
   ```bash
   npm start
   ```

   The server will start on port 3000 (or your configured PORT) and automatically serve the client files.

5. **Access the App**
   Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## 📖 Usage Guide

1. **Register**: Create an account with a username, email, and password.
2. **Get Your ID**: Upon registration, you will be assigned a unique **6-digit ID**.
3. **Connect**: Share your ID with a friend or enter their ID in the sidebar to start chatting.
4. **Chat**: Messages and images exchanged are automatically encrypted.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Suryanarayan Panda**
- [GitHub Profile](https://github.com/suryanarayanpanda)

---

*SecureChat - Privacy is not an option, it's a right.*
