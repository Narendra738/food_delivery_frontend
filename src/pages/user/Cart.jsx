import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getCart, updateCartQuantity, removeFromCart, clearCart, getCartTotal } from '../../services/cartService';
import { orderAPI, restaurantAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Cart = () => {
  const [cart, setCart] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const cartData = getCart();
    setCart(cartData);
    if (cartData.length > 0 && cartData[0].restaurantId) {
      loadRestaurant(cartData[0].restaurantId);
    }
  }, []);

  const loadRestaurant = async (restaurantId) => {
    try {
      // Ensure restaurantId is a string (backend uses string IDs)
      const restaurantIdStr = String(restaurantId);
      const response = await restaurantAPI.getById(restaurantIdStr);
      setRestaurant(response.restaurant);
    } catch (error) {
      console.error('Failed to load restaurant:', error);
      // If restaurant load fails, we'll use the restaurantId from cart directly
      // This allows the order to still be placed
    }
  };

  const handleQuantityChange = (itemId, newQuantity) => {
    updateCartQuantity(itemId, newQuantity);
    setCart(getCart());
    refreshCart();
  };

  const handleRemove = (itemId) => {
    removeFromCart(itemId);
    const updatedCart = getCart();
    setCart(updatedCart);
    if (updatedCart.length === 0) {
      setRestaurant(null);
    }
    refreshCart();
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Get restaurantId from cart if restaurant state is not loaded
    const restaurantId = restaurant?.id || cart[0]?.restaurantId;

    if (!restaurantId) {
      alert('Restaurant information is missing. Please add items to cart again.');
      return;
    }

    try {
      // Ensure restaurantId is a string
      const restaurantIdStr = String(restaurantId);

      // Transform cart items to match backend API format
      const items = cart.map(cartItem => ({
        menuItemId: String(cartItem.item.id), // Ensure menuItemId is string
        quantity: cartItem.quantity,
      }));

      await orderAPI.create({
        restaurantId: restaurantIdStr,
        items,
      });

      clearCart();
      setCart([]);
      setRestaurant(null);
      refreshCart();
      navigate('/user/orders');
    } catch (error) {
      alert(error.message || 'Failed to place order');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-backgroundDark flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-textPrimary dark:text-white mb-4">
            Your cart is empty
          </h2>
          <button
            onClick={() => navigate('/user/home')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Browse Restaurants
          </button>
        </div>
      </div>
    );
  }

  const total = getCartTotal();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-backgroundDark">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-textPrimary dark:text-white mb-8">Your Cart</h1>

        {restaurant && (
          <div className="bg-cardLight dark:bg-cardDark rounded-lg shadow-md p-4 mb-6">
            <h2 className="text-xl font-semibold text-textPrimary dark:text-white">
              {restaurant.name}
            </h2>
            <p className="text-textSecondary dark:text-gray-400">{restaurant.cuisine}</p>
          </div>
        )}

        <div className="bg-cardLight dark:bg-cardDark rounded-lg shadow-md p-6 mb-6">
          {cart.map((cartItem) => (
            <div
              key={cartItem.item.id}
              className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
            >
              <div className="flex items-center space-x-4 flex-1">
                {cartItem.item.image ? (
                  <img
                    src={cartItem.item.image}
                    alt={cartItem.item.name}
                    className="w-20 h-20 object-cover rounded"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-semibold text-textPrimary dark:text-white">
                    {cartItem.item.name}
                  </h3>
                  <p className="text-textSecondary dark:text-gray-400">
                    ₹{cartItem.item.price}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(cartItem.item.id, cartItem.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-textPrimary dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-textPrimary dark:text-white font-medium w-8 text-center">
                    {cartItem.quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(cartItem.item.id, cartItem.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-textPrimary dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-lg font-semibold text-primary w-24 text-right">
                  ₹{cartItem.item.price * cartItem.quantity}
                </span>
                <button
                  onClick={() => handleRemove(cartItem.item.id)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-cardLight dark:bg-cardDark rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-semibold text-textPrimary dark:text-white">
              Total
            </span>
            <span className="text-2xl font-bold text-primary">₹{total}</span>
          </div>
          <button
            onClick={handlePlaceOrder}
            className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
