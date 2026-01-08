import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { restaurantAPI } from '../../services/api';
import { addToCart, getCart } from '../../services/cartService';
import { useCart } from '../../context/CartContext';

const RestaurantDetail = () => {
  const { id } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { refreshCart } = useCart();

  useEffect(() => {
    loadRestaurant();
    setCart(getCart());
  }, [id]);

  const loadRestaurant = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch restaurant and menu from backend
      const [restaurantRes, menuRes] = await Promise.all([
        restaurantAPI.getById(id).catch(() => null),
        restaurantAPI.getMenu(id).catch(() => null),
      ]);

      if (restaurantRes) {
        setRestaurant(restaurantRes.restaurant);
      }

      if (menuRes) {
        setMenuItems(menuRes.menuItems || []);
      } else if (restaurantRes && restaurantRes.restaurant?.menuItems) {
        // Fallback to menu items from restaurant response
        setMenuItems(restaurantRes.restaurant.menuItems || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load restaurant');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (item) => {
    // Use restaurant id from params (already a string from URL)
    addToCart(item, id);
    setCart(getCart());
    refreshCart();
  };

  const getItemQuantity = (itemId) => {
    const cartItem = cart.find(c => c.item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-textPrimary dark:text-white">Loading...</div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-textPrimary dark:text-white">
          {error || 'Restaurant not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-backgroundDark">
      <div className="relative h-64 md:h-96 overflow-hidden bg-gray-900">
        {(restaurant.banner || (menuItems.length > 0 && menuItems[0].image)) ? (
          <img
            src={restaurant.banner || menuItems[0].image}
            alt={restaurant.name}
            className="w-full h-full object-cover opacity-80"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-800">
            <span className="text-4xl mb-2">🍽️</span>
            <span className="text-gray-500 dark:text-gray-400 font-medium">No Banner Image</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h1 className="text-4xl font-bold mb-2">{restaurant.name}</h1>
          <p className="text-lg mb-2">{restaurant.cuisine}</p>
          <div className="flex items-center">
            <span className="text-yellow-400">⭐</span>
            <span className="ml-2 text-lg font-medium">{restaurant.rating}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-textPrimary dark:text-white mb-6">Menu</h2>

        {menuItems.length === 0 ? (
          <div className="bg-cardLight dark:bg-cardDark rounded-lg shadow-md p-8 text-center">
            <p className="text-textSecondary dark:text-gray-400">
              No menu items available yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className="bg-cardLight dark:bg-cardDark rounded-lg shadow-md overflow-hidden"
              >
                <div className="relative h-48 overflow-hidden">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {!item.image && (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                  {item.veg && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-medium">
                      VEG
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-textPrimary dark:text-white mb-1">
                    {item.name}
                  </h3>
                  <p className="text-textSecondary dark:text-gray-400 text-sm mb-3">
                    {item.description || 'No description'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      ₹{item.price}
                    </span>
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      {getItemQuantity(item.id) > 0
                        ? `Add More (${getItemQuantity(item.id)})`
                        : 'Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantDetail;
