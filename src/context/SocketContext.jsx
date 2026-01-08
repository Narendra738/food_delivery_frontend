import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

import { toast } from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        let newSocket;

        if (user) {
            const token = localStorage.getItem('zestro_token');
            const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

            if (token) {
                newSocket = io(SOCKET_URL, {
                    auth: {
                        token: token,
                    },
                    transports: ['websocket', 'polling'],
                });

                newSocket.on('connect', () => {
                    console.log('Socket connected via Context:', newSocket.id);
                });

                newSocket.on('connect_error', (err) => {
                    console.error('Socket connection error:', err);
                });

                newSocket.on('NOTIFICATION', (data) => {
                    console.log('SocketContext: Received NOTIFICATION', data);
                    toast(data.message, {
                        icon: '🔔',
                        style: {
                            borderRadius: '10px',
                            background: '#333',
                            color: '#fff',
                        },
                    });
                });

                setSocket(newSocket);
            }
        }

        return () => {
            if (newSocket) {
                newSocket.disconnect();
                console.log('Socket disconnected via Context');
            }
            setSocket(null);
        };
    }, [user]);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
