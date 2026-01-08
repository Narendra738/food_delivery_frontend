import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Home from './pages/user/Home';
import RestaurantDetail from './pages/user/RestaurantDetail';
import Cart from './pages/user/Cart';
import Orders from './pages/user/Orders';
import RestaurantDashboard from './pages/restaurant/Dashboard';
import RiderDashboard from './pages/rider/Dashboard';
import Profile from './pages/shared/Profile';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <CartProvider>
            <div className="min-h-screen bg-backgroundLight dark:bg-backgroundDark">
              <Toaster
                position="top-right"
                toastOptions={{ duration: 4000 }}
                containerStyle={{ zIndex: 99999, top: '80px' }}
              />
              <Navbar />
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                <Route
                  path="/user/home"
                  element={
                    <ProtectedRoute allowedRoles={['Customer']}>
                      <Home />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/restaurant/:id"
                  element={
                    <ProtectedRoute allowedRoles={['Customer']}>
                      <RestaurantDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/cart"
                  element={
                    <ProtectedRoute allowedRoles={['Customer']}>
                      <Cart />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/user/orders"
                  element={
                    <ProtectedRoute allowedRoles={['Customer']}>
                      <Orders />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/restaurant/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['Restaurant']}>
                      <RestaurantDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/rider/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['Rider']}>
                      <RiderDashboard />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute allowedRoles={['Customer', 'Restaurant', 'Rider']}>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </CartProvider>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
