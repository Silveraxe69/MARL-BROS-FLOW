import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const connectSocket = () => {
  if (!socket || !socket.connected) {
    socket = io(SOCKET_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });

    socket.on('connect', () => {
      socket.emit('join_admin'); // Join admin channel
    });

    socket.on('disconnect', () => {
      // Socket disconnected
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

// Event listeners
export const onBusLocationUpdate = (callback) => {
  if (socket) {
    socket.on('bus_location_update', callback);
  }
};

export const onBusETAUpdate = (callback) => {
  if (socket) {
    socket.on('bus_eta_update', callback);
  }
};

export const onCrowdUpdate = (callback) => {
  if (socket) {
    socket.on('crowd_update', callback);
  }
};

export const offEvent = (event, callback) => {
  if (socket) {
    socket.off(event, callback);
  }
};

export default {
  connectSocket,
  disconnectSocket,
  getSocket,
  onBusLocationUpdate,
  onBusETAUpdate,
  onCrowdUpdate,
  offEvent,
};
