import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;

export const connectSocket = (user, token) => {
  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    auth: {
      token: token, // Pass JWT token
    },
    transports: ['websocket', 'polling'],
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket.id);
    // Backend automatically joins rooms based on JWT token
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => {
  return socket;
};

// Mock events for development (when no backend is available)
export const setupMockSocketEvents = (socketInstance, user) => {
  if (!socketInstance || !user) return;

  // Listen for new orders (Restaurant)
  if (user.role === 'Restaurant') {
    socketInstance.on('NEW_ORDER', (order) => {
      console.log('New order received:', order);
      // Show toast notification (you can implement toast notifications here)
      if (window.showToast) {
        window.showToast('New order received!', 'info');
      }
    });
  }

  // Listen for order status updates (Customer)
  if (user.role === 'Customer') {
    socketInstance.on('ORDER_STATUS_UPDATE', (data) => {
      console.log('Order status updated:', data);
      if (window.showToast) {
        window.showToast(`Order ${data.orderId} is now ${data.status}`, 'info');
      }
    });
  }

  // Listen for order assignments (Rider)
  if (user.role === 'Rider') {
    socketInstance.on('ORDER_ASSIGNED', (order) => {
      console.log('Order assigned:', order);
      if (window.showToast) {
        window.showToast('New order available for pickup!', 'info');
      }
    });
  }
};
