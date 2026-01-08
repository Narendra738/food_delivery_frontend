import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-white dark:from-primary/20 dark:to-backgroundDark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-primary mb-4">Zestro</h1>
          <p className="text-2xl text-textSecondary dark:text-gray-300 mb-8">
            Order delicious food from your favorite restaurants
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/signup"
              className="bg-primary text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="bg-white dark:bg-cardDark text-primary px-8 py-3 rounded-lg text-lg font-medium border-2 border-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-cardLight dark:bg-cardDark rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">🍔</div>
            <h3 className="text-xl font-semibold text-textPrimary dark:text-white mb-2">
              Browse Restaurants
            </h3>
            <p className="text-textSecondary dark:text-gray-400">
              Explore a wide variety of restaurants and cuisines
            </p>
          </div>

          <div className="bg-cardLight dark:bg-cardDark rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-textPrimary dark:text-white mb-2">
              Fast Delivery
            </h3>
            <p className="text-textSecondary dark:text-gray-400">
              Get your food delivered quickly to your doorstep
            </p>
          </div>

          <div className="bg-cardLight dark:bg-cardDark rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold text-textPrimary dark:text-white mb-2">
              Quality Assured
            </h3>
            <p className="text-textSecondary dark:text-gray-400">
              Only the best restaurants and quality food
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
