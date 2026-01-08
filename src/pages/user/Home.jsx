import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { restaurantAPI } from '../../services/api';
import { restaurants as mockRestaurants } from '../../data/restaurants';

const Home = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      const response = await restaurantAPI.getAll();
      console.log('Home: Loaded restaurants:', response.restaurants);
      if (response.restaurants && response.restaurants.length > 0) {
        setRestaurants(response.restaurants);
      } else {
        // Fallback to mock data if backend returns empty
        setRestaurants(mockRestaurants);
      }
    } catch (error) {
      console.error('Failed to load restaurants:', error);
      // Fallback to mock data on error
      setRestaurants(mockRestaurants);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-backgroundDark flex items-center justify-center">
        <div className="text-textPrimary dark:text-white">Loading restaurants...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-backgroundDark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-textPrimary dark:text-white mb-2">
          Welcome to Zestro
        </h1>
        <p className="text-textSecondary dark:text-gray-400 mb-8">
          Discover amazing restaurants near you
        </p>

        {restaurants.length === 0 ? (
          <div className="bg-cardLight dark:bg-cardDark rounded-lg shadow-md p-8 text-center">
            <p className="text-textSecondary dark:text-gray-400">
              No restaurants available yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                to={`/user/restaurant/${restaurant.id}`}
                className="bg-cardLight dark:bg-cardDark rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
              >
                <div className="relative h-48 overflow-hidden">
                  {(restaurant.banner || restaurant.image || (restaurant.menuItems && restaurant.menuItems.length > 0 && restaurant.menuItems[0].image)) && (
                    <img
                      src={restaurant.banner || restaurant.image || restaurant.menuItems[0].image}
                      alt={restaurant.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {!(restaurant.banner || restaurant.image || (restaurant.menuItems && restaurant.menuItems.length > 0 && restaurant.menuItems[0].image)) && (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      <span className="text-gray-400">No Image</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-textPrimary dark:text-white mb-1">
                    {restaurant.name}
                  </h3>
                  <p className="text-textSecondary dark:text-gray-400 text-sm mb-2">
                    {restaurant.cuisine}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-yellow-500">⭐</span>
                      <span className="ml-1 text-textPrimary dark:text-white font-medium">
                        {restaurant.rating || '0.0'}
                      </span>
                    </div>
                    {restaurant.menuItems && (
                      <span className="text-xs text-textSecondary dark:text-gray-400">
                        {restaurant.menuItems.length} items
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
