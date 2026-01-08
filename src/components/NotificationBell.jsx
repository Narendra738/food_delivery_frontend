import { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { notificationAPI } from '../services/api';

const NotificationBell = () => {
    const socket = useSocket();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch initial notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await notificationAPI.getAll();
                setNotifications(response.notifications);
                setUnreadCount(response.notifications.filter(n => !n.read).length);
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
            }
        };
        fetchNotifications();
    }, []);

    // Listen for real-time notifications
    useEffect(() => {
        if (!socket) return;

        const handleNotification = (newNotification) => {
            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);
        };

        socket.on('NOTIFICATION', handleNotification);

        return () => {
            socket.off('NOTIFICATION', handleNotification);
        };
    }, [socket]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await notificationAPI.markRead(notificationId);
            setNotifications(prev => prev.map(n =>
                n._id === notificationId || n.id === notificationId
                    ? { ...n, read: true }
                    : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationAPI.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                title="Notifications"
            >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform translate-x-1/4 -translate-y-1/4">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-cardDark rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                        <h3 className="font-semibold text-textPrimary dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-xs text-primary hover:underline"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-textSecondary dark:text-gray-400">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id || notification.id || Math.random()}
                                    className={`p-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                        }`}
                                    onClick={() => !notification.read && handleMarkAsRead(notification._id || notification.id)}
                                >
                                    <p className="text-sm text-textPrimary dark:text-white mb-1">
                                        {notification.message}
                                    </p>
                                    <span className="text-xs text-textSecondary dark:text-gray-400">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
