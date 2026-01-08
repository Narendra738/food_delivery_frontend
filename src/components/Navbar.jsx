import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useDarkMode } from '../hooks/useDarkMode';
import NotificationBell from './NotificationBell';
import { toast } from 'react-hot-toast';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const [darkMode, toggleDarkMode] = useDarkMode();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/');
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const getNavLinks = () => {
    if (!user) {
      return (
        <>
          <Link to="/login" className="text-textPrimary dark:text-white hover:text-primary transition-colors">
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Sign Up
          </Link>
        </>
      );
    }

    const commonLinks = (
      <Link
        to="/profile"
        className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-textPrimary dark:text-white transition-colors font-medium"
      >
        Profile
      </Link>
    );

    if (user.role === 'Customer') {
      return (
        <>
          <Link
            to="/user/home"
            className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-textPrimary dark:text-white transition-colors font-medium"
          >
            Home
          </Link>
          <Link
            to="/user/cart"
            className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-textPrimary dark:text-white transition-colors font-medium relative"
          >
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </Link>
          <Link
            to="/user/orders"
            className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-textPrimary dark:text-white transition-colors font-medium"
          >
            Orders
          </Link>
          {commonLinks}
          <button
            onClick={handleLogoutClick}
            className="px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-textPrimary dark:text-white transition-colors font-medium text-left"
          >
            Logout
          </button>
        </>
      );
    }

    if (user.role === 'Restaurant') {
      return (
        <>
          <Link to="/restaurant/dashboard" className="text-textPrimary dark:text-white hover:text-primary transition-colors">
            Dashboard
          </Link>
          {commonLinks}
          <button
            onClick={handleLogoutClick}
            className="text-textPrimary dark:text-white hover:text-primary transition-colors"
          >
            Logout
          </button>
        </>
      );
    }

    if (user.role === 'Rider') {
      return (
        <>
          <Link to="/rider/dashboard" className="text-textPrimary dark:text-white hover:text-primary transition-colors">
            Dashboard
          </Link>
          {commonLinks}
          <button
            onClick={handleLogoutClick}
            className="text-textPrimary dark:text-white hover:text-primary transition-colors"
          >
            Logout
          </button>
        </>
      );
    }

    return null;
  };

  return (
    <>
      <nav className="bg-cardLight dark:bg-cardDark shadow-md border-b border-gray-200 dark:border-gray-700 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              to={user ? (user.role === 'Customer' ? '/user/home' : user.role === 'Restaurant' ? '/restaurant/dashboard' : '/rider/dashboard') : '/'}
              className="text-2xl font-bold text-primary flex items-center gap-2"
            >
              Zestro
              {user?.role === 'Rider' && <span title="Rider Profile">🛵</span>}
              {user?.role === 'Restaurant' && <span title="Restaurant Profile">🍽️</span>}
              {user?.role === 'Customer' && <span title="Customer Profile">👤</span>}
            </Link>
            <div className="flex items-center space-x-6">
              {getNavLinks()}
              {user && <NotificationBell />}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-textPrimary dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                aria-label="Toggle dark mode"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-cardDark rounded-lg shadow-xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-xl font-bold text-textPrimary dark:text-white mb-4">
              Confirm Logout
            </h3>
            <p className="text-textSecondary dark:text-gray-400 mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 rounded-lg text-textPrimary dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
