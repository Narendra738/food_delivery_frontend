import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { orderAPI, restaurantAPI } from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import StatusBadge from '../../components/StatusBadge';
import MenuManager from './MenuManager';

const Dashboard = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'menu', 'profile'
  const [restaurantData, setRestaurantData] = useState({ name: '', cuisine: '', banner: '' });

  useEffect(() => {
    if (user && activeTab === 'orders') {
      loadOrders();
    }
    if (user && activeTab === 'profile') {
      loadRestaurantProfile();
    }
  }, [user, activeTab]);

  const loadRestaurantProfile = async () => {
    try {
      const res = await restaurantAPI.getMyRestaurant();
      if (res.restaurant) {
        setRestaurantData({
          name: res.restaurant.name || '',
          cuisine: res.restaurant.cuisine || '',
          banner: res.restaurant.banner || '',
        });
      }
    } catch (error) {
      console.error("Failed to load profile", error);
    }
  };

  const activeTabHandler = (tab) => setActiveTab(tab);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await restaurantAPI.update(restaurantData);
      alert('Restaurant profile updated successfully!');
    } catch (error) {
      alert(error.message || 'Failed to update profile');
    }
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('NEW_ORDER', (order) => {
      // Add new order to top of list if not already present
      setOrders(prev => {
        if (prev.find(o => o.id === order.id)) return prev;
        return [order, ...prev];
      });
      // Optionally show a toast/alert
    });

    socket.on('ORDER_STATUS_UPDATE', (updatedData) => {
      setOrders(prev => prev.map(o =>
        o.id === updatedData.orderId ? { ...o, status: updatedData.status } : o
      ));
    });

    return () => {
      socket.off('NEW_ORDER');
      socket.off('ORDER_STATUS_UPDATE');
    };
  }, [socket]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getMyOrders();
      // Filter out delivered orders for dashboard
      setOrders(response.orders.filter(o => o.status !== 'DELIVERED'));
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await orderAPI.accept(orderId);
      await loadOrders();
    } catch (error) {
      alert(error.message || 'Failed to accept order');
    }
  };

  const handleUpdateStatus = async (orderId, status) => {
    try {
      await orderAPI.updateStatus(orderId, status);
      await loadOrders();
    } catch (error) {
      alert(error.message || 'Failed to update order status');
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
          Restaurant Dashboard
        </h1>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'orders'
              ? 'text-primary border-b-2 border-primary'
              : 'text-textSecondary dark:text-gray-400 hover:text-textPrimary dark:hover:text-white'
              }`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'menu'
              ? 'text-primary border-b-2 border-primary'
              : 'text-textSecondary dark:text-gray-400 hover:text-textPrimary dark:hover:text-white'
              }`}
          >
            Menu Management
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 font-medium transition-colors ${activeTab === 'profile'
              ? 'text-primary border-b-2 border-primary'
              : 'text-textSecondary dark:text-gray-400 hover:text-textPrimary dark:hover:text-white'
              }`}
          >
            Profile
          </button>
        </div>

        {activeTab === 'menu' && (
          console.log('Dashboard rendering MenuManager'),
          <MenuManager />
        )}

        {activeTab === 'orders' && (
          <>
            {loading ? (
              <div className="bg-cardLight dark:bg-cardDark rounded-lg shadow-md p-8 text-center">
                <p className="text-textSecondary dark:text-gray-400">Loading orders...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-cardLight dark:bg-cardDark rounded-lg shadow-md p-8 text-center">
                <p className="text-textSecondary dark:text-gray-400">
                  No pending orders at the moment
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-cardLight dark:bg-cardDark rounded-lg shadow-md p-6"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-textPrimary dark:text-white mb-1">
                          Order #{order.id}
                        </h3>
                        <p className="text-textSecondary dark:text-gray-400 text-sm">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mb-4">
                      {order.orderItems?.map((orderItem) => (
                        <div
                          key={orderItem.id}
                          className="flex justify-between items-center py-2"
                        >
                          <span className="text-textPrimary dark:text-white">
                            {orderItem.menuItem?.name || 'Unknown Item'} x {orderItem.quantity}
                          </span>
                          <span className="text-textSecondary dark:text-gray-400">
                            ₹{orderItem.price * orderItem.quantity}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mb-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-lg font-semibold text-textPrimary dark:text-white">
                        Total: ₹{order.total}
                      </span>
                    </div>

                    <div className="flex space-x-3">
                      {order.status === 'PLACED' && (
                        <button
                          onClick={() => handleAcceptOrder(order.id)}
                          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          Accept Order
                        </button>
                      )}
                      {order.status === 'ACCEPTED' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                          Start Preparing
                        </button>
                      )}
                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'READY')}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Ready for Pickup
                        </button>
                      )}
                      {order.status === 'READY' && (
                        <span className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-medium">
                          Waiting for Pickup
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        {activeTab === 'profile' && (
          <div className="bg-cardLight dark:bg-cardDark rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold text-textPrimary dark:text-white mb-6">Edit Restaurant Profile</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-textSecondary dark:text-gray-400 mb-1">
                  Restaurant Name
                </label>
                <input
                  type="text"
                  value={restaurantData.name}
                  onChange={(e) => setRestaurantData({ ...restaurantData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-textPrimary dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textSecondary dark:text-gray-400 mb-1">
                  Cuisine Type
                </label>
                <input
                  type="text"
                  value={restaurantData.cuisine}
                  onChange={(e) => setRestaurantData({ ...restaurantData, cuisine: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-textPrimary dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-textSecondary dark:text-gray-400 mb-1">
                  Banner Image URL
                </label>
                <input
                  type="url"
                  value={restaurantData.banner}
                  onChange={(e) => setRestaurantData({ ...restaurantData, banner: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-textPrimary dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <p className="text-xs text-textSecondary dark:text-gray-400 mt-1">
                  Leave empty to use main menu item image as fallback.
                </p>
              </div>

              {restaurantData.banner && (
                <div className="mt-2 relative h-40 w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600">
                  <img
                    src={restaurantData.banner}
                    alt="Banner Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Save Changes
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
