// Socket.IO Service for Real-time Chat
import { io } from 'socket.io-client';
import AsyncStorage from '../utils/AsyncStorage';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  /**
   * Initialize and connect to Socket.IO server
   * @param {string} serverUrl - The backend URL (e.g., "https://your-backend.railway.app")
   */
  async connect(serverUrl) {
    try {
      // Get JWT token from storage
      const token = await AsyncStorage.getItem('userToken');

      if (!token) {
        console.log('⚠️ No token found, cannot connect to socket');
        return false;
      }

      // If already connected, don't reconnect
      if (this.socket && this.connected) {
        console.log('✅ Socket already connected');
        return true;
      }

      console.log(`🔌 Connecting to socket server: ${serverUrl}`);

      // Create socket connection with authentication
      this.socket = io(serverUrl, {
        auth: {
          token: token,
        },
        transports: ['websocket', 'polling'], // Prefer websocket, fallback to polling
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        timeout: 20000,
      });

      // Setup event listeners
      this.setupEventListeners();

      return true;
    } catch (error) {
      console.log('❌ Socket connection error:', error);
      return false;
    }
  }

  /**
   * Setup internal socket event listeners
   */
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('✅ Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      this.connected = false;
      console.log(`🔌 Socket disconnected: ${reason}`);
    });

    this.socket.on('connect_error', (error) => {
      console.log('❌ Socket connection error:', error.message);
      this.connected = false;
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
      this.connected = true;
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt #${attemptNumber}`);
    });

    this.socket.on('reconnect_error', (error) => {
      console.log('❌ Reconnection error:', error.message);
    });

    this.socket.on('reconnect_failed', () => {
      console.log('❌ Reconnection failed after all attempts');
      this.connected = false;
    });
  }

  /**
   * Disconnect from socket server
   */
  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      this.listeners.clear();
    }
  }

  /**
   * Check if socket is connected
   */
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }

  // ==========================================
  // SINGLE CHAT METHODS
  // ==========================================

  /**
   * Join a specific chat room (for single/direct chat)
   * @param {string} chatId - The chat ID to join
   */
  joinChat(chatId) {
    if (!this.socket || !chatId) {
      console.log('⚠️ Cannot join chat: socket not connected or invalid chatId');
      return;
    }

    console.log(`💬 Joining chat room: ${chatId}`);
    this.socket.emit('join-chat', chatId);
  }

  /**
   * Leave a specific chat room
   * @param {string} chatId - The chat ID to leave
   */
  leaveChat(chatId) {
    if (!this.socket || !chatId) return;

    console.log(`👋 Leaving chat room: ${chatId}`);
    this.socket.emit('leave-chat', chatId);
  }

  /**
   * Listen for new messages in single chat
   * @param {Function} callback - Callback function to handle new messages
   */
  onNewMessage(callback) {
    if (!this.socket) return;

    this.socket.on('new-message', callback);
    console.log('👂 Listening for new messages');
  }

  /**
   * Remove listener for new messages
   */
  offNewMessage() {
    if (!this.socket) return;

    this.socket.off('new-message');
    console.log('🔇 Stopped listening for new messages');
  }

  // ==========================================
  // GROUP CHAT METHODS
  // ==========================================

  /**
   * Join the global group chat room
   */
  joinGroupChat() {
    if (!this.socket) {
      console.log('⚠️ Cannot join group chat: socket not connected');
      return;
    }

    console.log('👥 Joining group chat');
    this.socket.emit('join-group-chat');
  }

  /**
   * Leave the global group chat room
   */
  leaveGroupChat() {
    if (!this.socket) return;

    console.log('👋 Leaving group chat');
    this.socket.emit('leave-group-chat');
  }

  /**
   * Listen for new messages in group chat
   * @param {Function} callback - Callback function to handle new messages
   */
  onNewGroupMessage(callback) {
    if (!this.socket) return;

    this.socket.on('new-group-message', callback);
    console.log('👂 Listening for new group messages');
  }

  /**
   * Remove listener for new group messages
   */
  offNewGroupMessage() {
    if (!this.socket) return;

    this.socket.off('new-group-message');
    console.log('🔇 Stopped listening for new group messages');
  }

  // ==========================================
  // TYPING INDICATORS (Optional)
  // ==========================================

  /**
   * Emit typing event for single chat
   * @param {string} chatId - The chat ID
   */
  emitTyping(chatId) {
    if (!this.socket || !chatId) return;
    this.socket.emit('typing-single-chat', { chatId });
  }

  /**
   * Emit stop typing event for single chat
   * @param {string} chatId - The chat ID
   */
  emitStopTyping(chatId) {
    if (!this.socket || !chatId) return;
    this.socket.emit('stop-typing-single-chat', { chatId });
  }

  /**
   * Listen for typing events in single chat
   * @param {Function} callback - Callback function
   */
  onUserTyping(callback) {
    if (!this.socket) return;
    this.socket.on('user-typing', callback);
  }

  /**
   * Listen for stop typing events in single chat
   * @param {Function} callback - Callback function
   */
  onUserStopTyping(callback) {
    if (!this.socket) return;
    this.socket.on('user-stop-typing', callback);
  }

  /**
   * Emit typing event for group chat
   */
  emitTypingGroup() {
    if (!this.socket) return;
    this.socket.emit('typing-group-chat');
  }

  /**
   * Emit stop typing event for group chat
   */
  emitStopTypingGroup() {
    if (!this.socket) return;
    this.socket.emit('stop-typing-group-chat');
  }
}

// Export singleton instance
export default new SocketService();
