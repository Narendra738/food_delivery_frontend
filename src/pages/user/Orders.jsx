import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import StatusBadge from '../../components/StatusBadge';

const Orders = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      const response = await orderAPI.getMyOrders();
      setOrders(response.orders);
    } catch (err) {
      setError('Failed to load orders');
      console.error(err);
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

    const handleStatusUpdate = (updatedOrder) => {
      setOrders(prev => prev.map(o =>
        o.id === updatedOrder.orderId ? { ...o, status: updatedOrder.status } : o
      ));
    };

    socket.on('ORDER_STATUS_UPDATE', handleStatusUpdate);

    return () => {
      socket.off('ORDER_STATUS_UPDATE', handleStatusUpdate);
    };
  }, [socket]);

  const getRestaurant = (restaurantId) => {
    return getRestaurantById(restaurantId);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-textPrimary dark:text-white">Please login to view orders</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-backgroundDark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-textPrimary dark:text-white mb-4">
            No orders yet
          </h2>
          <p className="text-textSecondary dark:text-gray-400">
            Start ordering from your favorite restaurants!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-backgroundDark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-textPrimary dark:text-white mb-8">Your Orders</h1>

        <div className="space-y-4">
          {orders.map((order) => {
            return (
              <div
                key={order.id}
                className="bg-cardLight dark:bg-cardDark rounded-lg shadow-md p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-textPrimary dark:text-white mb-1">
                      {order.restaurant?.name || 'Restaurant'}
                    </h3>
                    <p className="text-textSecondary dark:text-gray-400 text-sm">
                      Order ID: {order.id}
                    </p>
                    <p className="text-textSecondary dark:text-gray-400 text-sm">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  {order.orderItems?.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-center py-2"
                    >
                      <span className="text-textPrimary dark:text-white">
                        {item.menuItem?.name} x {item.quantity}
                      </span>
                      <span className="text-textSecondary dark:text-gray-400">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-lg font-semibold text-textPrimary dark:text-white">
                    Total
                  </span>
                  <span className="text-xl font-bold text-primary">₹{order.total}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Orders;
