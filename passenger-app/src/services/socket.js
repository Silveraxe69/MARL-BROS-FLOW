import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect() {
    if (this.socket) {
      return;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['polling', 'websocket'],
      timeout: 20000,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Subscribe to bus location updates
  onBusLocationUpdate(callback) {
    if (!this.socket) {
      return;
    }
    this.socket.on('busLocationUpdate', callback);
  }

  // Subscribe to bus ETA updates
  onBusETAUpdate(callback) {
    if (!this.socket) {
      return;
    }
    this.socket.on('busETAUpdate', callback);
  }

  // Subscribe to crowd status updates
  onCrowdStatusUpdate(callback) {
    if (!this.socket) {
      return;
    }
    this.socket.on('crowdStatusUpdate', callback);
  }

  // Subscribe to route updates
  onRouteUpdate(callback) {
    if (!this.socket) {
      return;
    }
    this.socket.on('routeUpdate', callback);
  }

  // Remove event listeners
  off(eventName, callback) {
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
  }

  // Emit custom events
  emit(eventName, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(eventName, data);
    }
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
