import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import StatusBadge from '../../components/StatusBadge';

const Dashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const [availableRes, myRes] = await Promise.all([
        orderAPI.getAvailable(),
        orderAPI.getMyOrders()
      ]);
      setAvailableOrders(availableRes.orders);
      setMyOrders(myRes.orders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    socket.on('ORDER_ASSIGNED', (order) => {
      // Case 1: Restaurant accepted, became available
      if (order.status === 'ACCEPTED' && !order.riderId) {
        setAvailableOrders(prev => {
          if (prev.find(o => o.id === order.id)) return prev;
          return [order, ...prev];
        });
      }

      // Case 2: Rider picked it up (could be me or someone else)
      if (order.riderId) {
        // Remove from available
        setAvailableOrders(prev => prev.filter(o => o.id !== order.id));

        // If it's me, add/update in myOrders
        if (order.riderId === user?.id) {
          setMyOrders(prev => {
            const exists = prev.find(o => o.id === order.id);
            if (exists) return prev.map(o => o.id === order.id ? order : o);
            return [order, ...prev];
          });
        }
      }
    });

    socket.on('ORDER_STATUS_UPDATE', (data) => {
      // Update my bookings if relevant
      setMyOrders(prev => prev.map(o =>
        o.id === data.orderId ? { ...o, status: data.status } : o
      ));
    });

    return () => {
      socket.off('ORDER_ASSIGNED');
      socket.off('ORDER_STATUS_UPDATE');
    };
  }, [socket]);

  const handleAcceptOrder = async (orderId) => {
    try {
      await orderAPI.acceptRider(orderId);
      // Socket will handle the update
    } catch (error) {
      alert(error.message || 'Failed to accept order');
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await orderAPI.updateStatus(orderId, status);
      // Socket will handle the update
    } catch (error) {
      alert(error.message || 'Failed to update status');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-textPrimary dark:text-white">Please login</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-backgroundDark">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-textPrimary dark:text-white mb-8">
          Rider Dashboard
        </h1>

        {myOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-textPrimary dark:text-white mb-4">
              My Active Orders
            </h2>
            <div className="space-y-4">
              {myOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-cardLight dark:bg-cardDark rounded-lg shadow-md p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-textPrimary dark:text-white mb-1">
                        Order #{order.id}
                      </h3>
                      <p className="text-textSecondary dark:text-gray-400">
                        From: {order.restaurant?.name || 'Restaurant'}
                      </p>
                      <p className="text-textSecondary dark:text-gray-400 text-sm">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                    {order.orderItems?.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-2"
                      >
                        <span className="text-textPrimary dark:text-white">
                          {item.menuItem?.name} x {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-textPrimary dark:text-white">
                      Total: ₹{order.total}
                    </span>
                  </div>

                  <div className="space-x-4">
                    {(order.status === 'PREPARING' || order.status === 'READY' || order.status === 'ACCEPTED') && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PICKED')}
                        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                      >
                        Mark as Picked
                      </button>
                    )}

                    {order.status === 'PICKED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'DELIVERED')}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        Mark as Delivered
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-semibold text-textPrimary dark:text-white mb-4">
            Available Orders
          </h2>
          {availableOrders.length === 0 ? (
            <div className="bg-cardLight dark:bg-cardDark rounded-lg shadow-md p-8 text-center">
              <p className="text-textSecondary dark:text-gray-400">
                No available orders at the moment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-cardLight dark:bg-cardDark rounded-lg shadow-md p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-textPrimary dark:text-white mb-1">
                        Order #{order.id}
                      </h3>
                      <p className="text-textSecondary dark:text-gray-400">
                        From: {order.restaurant?.name || 'Restaurant'}
                      </p>
                      <p className="text-textSecondary dark:text-gray-400 text-sm">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                    {order.orderItems?.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-2"
                      >
                        <span className="text-textPrimary dark:text-white">
                          {item.menuItem?.name} x {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-textPrimary dark:text-white">
                      Total: ₹{order.total}
                    </span>
                  </div>

                  <button
                    onClick={() => handleAcceptOrder(order.id)}
                    className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Accept Job
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
