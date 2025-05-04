import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

// Create a context for socket
const SocketContext = createContext();

// Custom hook to access the socket context
export const useSocket = () => {
  return useContext(SocketContext);
};

// SocketProvider component which will wrap the app and provide the socket connection
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const connectionAttemptsRef = useRef(0);
  const isInitializedRef = useRef(false);
  const isConnectingRef = useRef(false);
  const MAX_RECONNECT_ATTEMPTS = 5;

  useEffect(() => {
    let isMounted = true;

    const initializeSocket = () => {
      // Prevent multiple simultaneous initialization attempts
      if (isConnectingRef.current) {
        console.log('Socket connection already in progress, skipping initialization');
        return;
      }

      if (!user) {
        console.log('No user found, skipping socket initialization');
        return;
      }

      // If socket is already initialized and connected, don't reinitialize
      if (socketRef.current?.connected) {
        console.log('Socket already connected, skipping initialization');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found for socket connection');
        return;
      }

      isConnectingRef.current = true;

      // Only clean up if we're reinitializing
      if (isInitializedRef.current && socketRef.current) {
        console.log('Reinitializing socket connection');
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      console.log('Initializing socket connection with token:', token.substring(0, 10) + '...');
      
      const newSocket = io('http://localhost:8080', {
        withCredentials: true,
        transports: ['polling', 'websocket'],
        autoConnect: false,
        auth: {
          token: token
        },
        reconnection: true,
        reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 10000,
        forceNew: true,
        path: '/socket.io/',
        extraHeaders: {
          'Authorization': `Bearer ${token}`
        }
      });

      socketRef.current = newSocket;
      isInitializedRef.current = true;

      newSocket.on('connect', () => {
        if (!isMounted) return;
        console.log('Socket connected successfully. Socket ID:', newSocket.id);
        connectionAttemptsRef.current = 0;
        isConnectingRef.current = false;
        if (user._id) {
          console.log('Registering user with ID:', user._id);
          newSocket.emit('registerUser', user._id);
        }
        setSocket(newSocket);
      });

      newSocket.on('connect_error', (error) => {
        if (!isMounted) return;
        console.error('Socket connection error:', {
          message: error.message,
          description: error.description,
          type: error.type,
          context: error
        });
        
        connectionAttemptsRef.current++;
        isConnectingRef.current = false;
        
        if (connectionAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
          console.error('Max reconnection attempts reached');
          return;
        }

        // Clear any existing reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        // Attempt to reconnect after a delay
        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMounted && socketRef.current) {
            console.log(`Attempting to reconnect (attempt ${connectionAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})...`);
            isConnectingRef.current = true;
            socketRef.current.connect();
          }
        }, 5000);
      });

      newSocket.on('disconnect', (reason) => {
        if (!isMounted) return;
        console.log('Socket disconnected:', {
          reason,
          socketId: newSocket.id,
          wasConnected: newSocket.connected
        });
        
        isConnectingRef.current = false;
        
        if (reason === 'io server disconnect') {
          console.log('Server initiated disconnect, attempting to reconnect...');
          isConnectingRef.current = true;
          newSocket.connect();
        }
      });

      newSocket.on('error', (error) => {
        if (!isMounted) return;
        console.error('Socket error:', {
          message: error.message,
          type: error.type,
          context: error
        });
        isConnectingRef.current = false;
      });

      newSocket.on('reconnect_attempt', (attemptNumber) => {
        if (!isMounted) return;
        console.log('Reconnection attempt:', {
          attempt: attemptNumber,
          socketId: newSocket.id
        });
        isConnectingRef.current = true;
      });

      newSocket.on('reconnect', (attemptNumber) => {
        if (!isMounted) return;
        console.log('Reconnected successfully:', {
          attempts: attemptNumber,
          socketId: newSocket.id
        });
        connectionAttemptsRef.current = 0;
        isConnectingRef.current = false;
      });

      newSocket.on('reconnect_error', (error) => {
        if (!isMounted) return;
        console.error('Reconnection error:', {
          message: error.message,
          type: error.type,
          context: error
        });
        isConnectingRef.current = false;
      });

      newSocket.on('reconnect_failed', () => {
        if (!isMounted) return;
        console.error('Failed to reconnect after all attempts');
        isConnectingRef.current = false;
      });

      // Connect after setting up all event listeners
      console.log('Attempting to connect socket...');
      newSocket.connect();
    };

    initializeSocket();

    return () => {
      isMounted = false;
      
      // Clear any pending reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Only clean up if we're actually unmounting the component
      if (socketRef.current && !isInitializedRef.current) {
        console.log('Cleaning up socket connection:', {
          socketId: socketRef.current.id,
          wasConnected: socketRef.current.connected
        });
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
